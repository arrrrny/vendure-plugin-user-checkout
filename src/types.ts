/**
 * @description
 * These are the configuration options for the plugin.
 */
export interface UserCheckoutOptions {
  useExternalEmailIfExists?: boolean;
  useExternalNameIfExists?: boolean;
  useExternalPhoneNumberIfExists?: boolean;
  useObfuscatedEmail?: boolean;
  useObfuscatePhoneNumber?: boolean;
  useObfuscatedName?: boolean;
  obfuscatedEmailDomain?: string;
  obfuscatedPhoneNumberDigits?: number;
}
