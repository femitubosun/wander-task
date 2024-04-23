import { DateTime } from "luxon";
import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) throw new Error("ENV_NOT_FOUND_ERROR");

export const appConfig = {
  WEATHER_API_URL: process.env["WEATHER_API_URL"],
  PORT: parseInt(process.env["PORT"]) || 3000,
  CACHE: {
    EXPIRE_AFTER_MINUTES:
      parseInt(process.env["CACHE_EXPIRE_AFTER_MINUTES"]) || 60,
    DB_URL: process.env["CACHE_DB_URL"],
    CACHE_TABLE_NAME: process.env["CACHE_TABLE_NAME"],
  },
  QUEUE: {
    REDIS_QUEUE_HOST: process.env.NODE_ENV === "test" ? "localhost" : "redis",
    REDIS_QUEUE_PORT: process.env.REDIS_QUEUE_PORT
      ? parseInt(process.env.REDIS_QUEUE_PORT)
      : 6379,
    FAILED_SEARCH_QUEUE_NAME:
      process.env.FAILED_JOB_QUEUE_NAME || "failed-search-queue",
    FAILED_JOB_RETRIES: process.env.FAILED_JOB_RETRIES
      ? parseInt(process.env.FAILED_JOB_RETRIES)
      : 3,
    FAILED_JOB_RETRY_DELAY: process.env.FAILED_JOB_RETRY_DELAY
      ? parseInt(process.env.FAILED_JOB_RETRY_DELAY)
      : 2000,
  },

  get CURRENT_DATE_TIME() {
    return DateTime.now();
  },
};

// console.log({ appConfig });
