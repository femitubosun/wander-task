declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEATHER_API_URL: string;
      PORT: string;
      CACHE_DB_NAME: string;
      CACHE_TABLE_NAME: string;
      EXPIRE_AFTER_MINUTES: string;
    }
  }
}

export {};
