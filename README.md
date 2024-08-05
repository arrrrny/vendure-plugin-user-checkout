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
