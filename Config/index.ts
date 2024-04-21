import { businessConfig } from "./businessConfig";
import { cacheConfig } from "./cacheConfig";
import { DateTime } from "luxon";

export const appConfig = {
  WEATHER_API_URL: "https://staging.v4.api.wander.com/hiring-test/weather",
  PORT: 3000,
  CACHE_TABLE_NAME: "weather_cache",
  ...businessConfig,
  cacheConfig,

  get CURRENT_DATE_TIME() {
    return DateTime.now();
  },
};
