declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEATHER_API_URL: string;
      PORT: string;
      CACHE_DB_URL: string;
      CACHE_TABLE_NAME: string;
      CACHE_EXPIRE_AFTER_MINUTES: string;
    }
  }
}

export {};
