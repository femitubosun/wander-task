import { DateTime } from "luxon";
import dotenv from "dotenv";
import path from "path";

const envFound = dotenv.config({
  path: path.join(__dirname, ".env"),
});

if (envFound.error) throw new Error("ENV_NOT_FOUND_ERROR");

export const appConfig = {
  WEATHER_API_URL: process.env["WEATHER_API_URL"],

  PORT: parseInt(process.env["PORT"], 10) || 3000,

  CACHE: {
    EXPIRE_AFTER_MINUTES:
      parseInt(process.env["CACHE_EXPIRE_AFTER_MINUTES"], 10) || 60,
    DB_URL: process.env["CACHE_DB_URL"],
    CACHE_TABLE_NAME: process.env["CACHE_TABLE_NAME"],
  },
  get CURRENT_DATE_TIME() {
    return DateTime.now();
  },
};
