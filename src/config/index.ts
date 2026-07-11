import dotenv from "dotenv";
dotenv.config();
interface EnvVariables {
  PORT: string;
  DATABASE_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_SALT_ROUND: string;
  APP_LOCAL_URL: string;
  VERCEL_URL: string;
  SSL_COMMERZ_STORE_ID: string;
  SSL_COMMERZ_STORE_PASSWORD: string;
  VALIDATION_IPN_URL: string;
}
const loadEnvVariables = (): EnvVariables => {
  const envVars: string[] = [
    "PORT",
    "DATABASE_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "BCRYPT_SALT_ROUND",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
    "APP_LOCAL_URL",
    "VERCEL_URL",
    "SSL_COMMERZ_STORE_ID",
    "SSL_COMMERZ_STORE_PASSWORD",
    "VALIDATION_IPN_URL",
  ];
  envVars.forEach((element) => {
    if (!process.env[element]) {
      throw new Error(`Required environmental variable missing: ${element}`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    APP_LOCAL_URL: process.env.APP_LOCAL_URL as string,
    VERCEL_URL: process.env.VERCEL_URL as string,
    SSL_COMMERZ_STORE_ID: process.env.SSL_COMMERZ_STORE_ID as string,
    SSL_COMMERZ_STORE_PASSWORD: process.env
      .SSL_COMMERZ_STORE_PASSWORD as string,
    VALIDATION_IPN_URL: process.env.VALIDATION_IPN_URL as string,
  };
};
export const envVars = loadEnvVariables();
