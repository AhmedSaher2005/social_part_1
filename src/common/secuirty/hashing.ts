import bcrypt from "bcrypt";
import { SALT_ROUND } from "../../config/config.service.js";

export class HashSecurity {
  private readonly _saltRounds = Number(SALT_ROUND) || 12;

  Hash = async (text: string): Promise<string> => {
    return await bcrypt.hash(text, this._saltRounds);
  };

  Compare = async (text: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(text, hashed);
  };
}
