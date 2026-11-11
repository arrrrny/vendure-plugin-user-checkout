<!-- ZURAFFA-LAUNCH-PROMO (valid until Dec 1, 2026) -->
## 🦒 [Zuraffa Browser](https://zuraffa.com) — now live

<div align="center">
  <a href="https://zuraffa.com"><img src="https://zuraffa.com/img/zuraffa-browser-home.jpg" alt="Zuraffa Browser — 10 Browsers. One window." width="800"></a>
</div>

**[Zuraffa Browser](https://zuraffa.com)** — the multi-tasking browser for AI agents & humans — is live on the [Mac App Store](https://apps.apple.com/app/id6811352058).

🎁 **Launch offer: 6 months free with code `ZURAFFA`** — no credit card, no subscription, no payment. Redeem in-app until **Dec 1, 2026**.

---

# Vendure Plugin: User Checkout

## Introduction

The User Checkout Plugin for Vendure allows externally authenticated users to checkout without needing an email address, first name, or last name. The plugin provides strategies to create and determine active orders based on users' external authentication methods, offering flexibility and convenience for both users and administrators.

## Features

- **External Authentication Support**: Utilizes external authentication methods to identify users.
- **Obfuscation Options**: Generates obfuscated email addresses, names, and phone numbers for users.
- **Automatic Customer Creation**: Automatically creates customer profiles from user details.
- **Customizable Configuration**: Allows for customization of obfuscation options and using external authentication metadata.

## Usage

1. Add the `UserCheckoutPlugin` to your Vendure server configuration:

```ts
import { VendureConfig } from '@vendure/core';
import { UserCheckoutPlugin } from 'vendure-plugin-user-checkout';

export const config: VendureConfig = {
  // ... other configuration options
  plugins: [
    UserCheckoutPlugin.init({
      useExternalEmailIfExists: true, // Optional, default is true
      useExternalNameIfExists: true, // Optional, default is true
      useExternalPhoneNumberIfExists: true, // Optional, default is true
      useObfuscatedEmail: true, // Optional, default is true
      useObfuscatePhoneNumber: true, // Optional, default is true
      useObfuscatedName: true, // Optional, default is true
      obfuscatedEmailDomain: "zikzak.wtf", // Optional, default is "obfuscated.com"
      obfuscatedPhoneNumberDigits: 10, // Optional, default is 10
    }),
  ],
};
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/arrrrny/vendure-plugin-user-checkout).
