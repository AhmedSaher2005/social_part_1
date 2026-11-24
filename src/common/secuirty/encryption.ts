import crypto from "node:crypto";
import { ENCRYPT_KEY } from "../../config/config.service.js";

export class EncryptionSecurity {
  private readonly _key = Buffer.from(ENCRYPT_KEY as string);
  private readonly _ivLength = 16;
  constructor() {}
  Encrypt = (text: string): string => {
    const iv = crypto.randomBytes(this._ivLength);

    const cipher = crypto.createCipheriv("aes-256-cbc", this._key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  };

  Decrypt = (text: string): string => {
    const [ivHex, encryptedText] = text.split(":") as [string, string];

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", this._key, iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  };
}
