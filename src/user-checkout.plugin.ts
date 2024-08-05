import { PluginCommonModule, VendurePlugin } from "@vendure/core";

import { UserCheckoutOptions } from "./types";
import { USER_CHECKOUT_PLUGIN_OPTIONS } from "./constants";
import { UserCheckoutActiveOrderStrategy } from "./config/user-checkout-active-order-strategy";

/**
 * @description
 * This is an example plugin that you can use as the basis for your own custom plugin.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    {
      provide: USER_CHECKOUT_PLUGIN_OPTIONS,
      useFactory: () => UserCheckoutPlugin.options,
    },
  ],
  configuration: config => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    config.orderOptions.activeOrderStrategy = new UserCheckoutActiveOrderStrategy();

    return config;
},

  compatibility: '^2.0.0',

})
export class UserCheckoutPlugin {
  static options: UserCheckoutOptions;

  static init(options: UserCheckoutOptions) {
    this.options = options;
    return UserCheckoutPlugin;
  }
}
