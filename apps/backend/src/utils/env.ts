import dotenv from "dotenv";
dotenv.config();

export const envVariables = {
  REDIS_URI: process.env.REDIS_URI as string,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET as string,
  COOKIE_SECRET: process.env.COOKIE_SECRET as string,
};
