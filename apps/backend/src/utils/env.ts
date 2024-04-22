import dotenv from "dotenv";
dotenv.config();

export const envVariables = {
  REDIS_URI: process.env.REDIS_URI as string,
  PORT: process.env.PORT,
};
