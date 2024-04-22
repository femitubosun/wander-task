export type CacheRow = {
  id: number;
  cacheKey: string;
  weatherData: string;
  isExpired: boolean;
  createdAt: Date;
};
