import { config } from "dotenv";
import { resolve } from "node:path";
const NODE_ENV = process.env.NODE_ENV;
const envPath = {
  development: ".env.development",
  production: ".env.production",
};
 config({ path: resolve(`${envPath[NODE_ENV as keyof typeof envPath]}`) });
export const PORT= +process.env.PORT!
export const DB_URL = process.env.DB_URL!;
export const REDIS_URL = process.env.REDIS_URL!;
export const ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE!;
export const REFRESH_TOKEN_SIGNATURE = process.env.REFRESH_TOKEN_SIGNATURE!;
export const ENCRYPT_KEY = process.env.ENCRYPT_KEY!;
export const SALT_ROUND = process.env.SALT_ROUND!;
export const EMAIL = process.env.EMAIL!;
export const PASSWORD = process.env.PASSWORD!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY!;
export const AWS_REGION = process.env.AWS_REGION!;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
