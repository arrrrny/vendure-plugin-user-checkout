import {
  ActiveOrderStrategy,
  AuthenticationMethod,
  ChannelService,
  Customer,
  CustomerService,
  ExternalAuthenticationMethod,
  GuestCheckoutError,
  HistoryService,
  Injector,
  InternalServerError,
  InvalidCredentialsError,
  Logger,
  Order,
  OrderService,
  RequestContext,
  RoleService,
  SessionService,
  TransactionalConnection,
  User,
  UserService,
} from "@vendure/core";
import { Obfuscator } from "../obfuscator";
import { HistoryEntryType } from "@vendure/common/lib/generated-shop-types";
import { UserCheckoutOptions } from "../types";
import { USER_CHECKOUT_PLUGIN_OPTIONS } from "../constants";
export class UserCheckoutActiveOrderStrategy implements ActiveOrderStrategy {
  private options: Required<UserCheckoutOptions> = {
    useExternalEmailIfExists: true,
    useExternalNameIfExists: true,
    useExternalPhoneNumberIfExists: true,
    useObfuscatedEmail: true,
    useObfuscatePhoneNumber: true,
    useObfuscatedName: true,
    obfuscatedEmailDomain: "obfuscated.com",
    obfuscatedPhoneNumberDigits: 10,
  };
  private connection: TransactionalConnection;
  private orderService: OrderService;
  private sessionService: SessionService;
  private userService: UserService;
  private customerService: CustomerService;
  private roleService: RoleService;
  private channelService: ChannelService;
  private historyService: HistoryService;
  name: "user-checkout-active-order-strategy";

  async init(injector: Injector) {
    this.connection = injector.get(TransactionalConnection);
    this.orderService = injector.get(OrderService);
    this.sessionService = injector.get(SessionService);
    this.userService = injector.get(UserService);
    this.roleService = injector.get(RoleService);
    this.customerService = injector.get(CustomerService);
    this.channelService = injector.get(ChannelService);
    this.historyService = injector.get(HistoryService);
    const options = injector.get(USER_CHECKOUT_PLUGIN_OPTIONS);
    this.options = { ...this.options, ...(options as object) };
  }

  async createActiveOrder(ctx: RequestContext) {
    if (!ctx.activeUserId) {
      throw new InvalidCredentialsError({
        authenticationError: "User is not authenticated.",
      });
    }
    const user = await this.userService.getUserById(ctx, ctx.activeUserId!);
    if (user == null) {
      throw new InvalidCredentialsError({
        authenticationError: "No user found.",
      });
    }
    const customer = await this.customerService.findOneByUserId(
      ctx,
      user.id,
      true,
    );
    if (customer == null) {
      await this._createCustomerFromUser(ctx, user);
    }
    Logger.info("Creating order with newly created customer");
    return this.orderService.create(ctx, ctx.activeUserId);
  }

  async _createCustomerFromUser(ctx: RequestContext, user: User) {
    const customerRole = await this.roleService.getCustomerRole(ctx);
    user.roles = [...(user.roles || []), customerRole];

    const authMethods: ExternalAuthenticationMethod[] | undefined =
      user?.authenticationMethods.map((method) => this._mapToExternal(method));
    const externalAuthMethod = authMethods?.find(
      (method) =>
        method.strategy === ctx.session?.authenticationStrategy &&
        method.externalIdentifier === ctx.session?.user?.identifier,
    );
    if (externalAuthMethod == null) {
      throw new InvalidCredentialsError({
        authenticationError: "User does not have matching external auth method",
      });
    }
    let emailAddress: string | undefined;
    if (this.options.useObfuscatedEmail) {
      emailAddress = Obfuscator.generateObfuscatedEmail(
        this.options.obfuscatedEmailDomain,
      );
    }
    if (
      this.options.useExternalEmailIfExists &&
      externalAuthMethod.metadata?.emailAddress?.length
    ) {
      emailAddress = externalAuthMethod.metadata?.emailAddress;
    }
    let firstName: string | undefined;
    if (this.options.useObfuscatedName) {
      firstName = Obfuscator.generateObfuscatedName("first");
    }
    if (
      this.options.useExternalNameIfExists &&
      externalAuthMethod.metadata?.firstName?.length
    ) {
      firstName = externalAuthMethod.metadata?.firstName;
    }
    let lastName: string | undefined;
    if (this.options.useObfuscatedName) {
      lastName = Obfuscator.generateObfuscatedName("last");
    }
    if (
      this.options.useExternalNameIfExists &&
      externalAuthMethod.metadata?.lastName?.length
    ) {
      lastName = externalAuthMethod.metadata?.lastName;
    }
    let phoneNumber: string | undefined;
    if (this.options.useObfuscatePhoneNumber) {
      phoneNumber = Obfuscator.generatePhoneNumber(
        this.options.obfuscatedPhoneNumberDigits,
      );
    }
    if (
      this.options.useExternalPhoneNumberIfExists &&
      externalAuthMethod.metadata?.phoneNumber?.length
    ) {
      phoneNumber = externalAuthMethod.metadata?.phoneNumber;
    }
    if (emailAddress == null) {
      throw new GuestCheckoutError({
        errorDetail: "Email Address is required",
      });
    }

    if (firstName == null || lastName == null) {
      throw new GuestCheckoutError({
        errorDetail: "FirstName and LastName is required",
      });
    }

    const savedUser = await this.connection.getRepository(ctx, User).save(user);
    const customer = new Customer({
      emailAddress,
      firstName,
      lastName,
      phoneNumber,
      user: savedUser,
      title: externalAuthMethod.metadata?.title,
    });

    await this.channelService.assignToCurrentChannel(customer, ctx);
    await this.connection.getRepository(ctx, Customer).save(customer);

    await this.historyService.createHistoryEntryForCustomer({
      customerId: customer.id,
      ctx,
      type: HistoryEntryType.CUSTOMER_REGISTERED,
      data: {
        strategy: externalAuthMethod.strategy,
      },
    });
  }

  async determineActiveOrder(ctx: RequestContext) {
    if (!ctx.session) {
      throw new InternalServerError("error.no-active-session");
    }

    let order = ctx.session.activeOrderId
      ? await this.connection
          .getRepository(ctx, Order)
          .createQueryBuilder("order")
          .leftJoin("order.channels", "channel")
          .where("order.id = :orderId", { orderId: ctx.session.activeOrderId })
          .andWhere("channel.id = :channelId", { channelId: ctx.channelId })
          .getOne()
      : undefined;
    if (order && order.active === false) {
      // edge case where an inactive order may not have been
      // removed from the session, i.e. the regular process was interrupted
      await this.sessionService.unsetActiveOrder(ctx, ctx.session);
      order = undefined;
    }
    if (!order) {
      if (ctx.activeUserId) {
        order = await this.orderService.getActiveOrderForUser(
          ctx,
          ctx.activeUserId,
        );
      }
    }
    return order || undefined;
  }
  _mapToExternal(authMethod: any): ExternalAuthenticationMethod {
    return {
      id: authMethod.id,
      user: authMethod.user,
      strategy: authMethod.strategy,
      externalIdentifier: authMethod.externalIdentifier,
      metadata: authMethod.metadata,
      createdAt: authMethod.createdAt,
      updatedAt: authMethod.updatedAt,
    };
  }
}
