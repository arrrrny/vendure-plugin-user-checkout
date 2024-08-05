import crypto from "crypto";
import base64url from "base64url";

export class Obfuscator {
  static generateShortUniqueId(): string {
    // Generate a random 8-byte (64-bit) string
    return crypto.randomBytes(8).toString("hex");
  }

  static generateObfuscatedName(prefix: string = "first"): string {
    const shortId = Obfuscator.generateShortUniqueId();
    const hash = crypto
      .createHash("sha1")
      .update(shortId)
      .digest("base64url")
      .substring(0, 8);
    return `${prefix}_${hash}`;
  }

  static generateObfuscatedEmail(domain: string): string {
    return `${Obfuscator.generateObfuscatedName("user")}@${domain}`;
  }
  static generatePhoneNumber(length: number): string {
    if (length <= 0) {
      throw new Error("Phone number length must be greater than 0.");
    }

    let phoneNumber = "";
    const digits = "0123456789";

    // Ensure the first digit is not zero
    phoneNumber += digits.charAt(
      Math.floor(Math.random() * (digits.length - 2)) + 2,
    );

    // Generate the remaining digits
    for (let i = 1; i < length; i++) {
      phoneNumber += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return phoneNumber;
  }
}
