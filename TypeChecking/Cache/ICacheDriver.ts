import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";

export interface ICacheDriver {
  getActive(key: string): Promise<WeatherCacheObject | null>;

  getExpired(key: string): Promise<WeatherCacheObject | null>;

  set(key: string, value: string): Promise<boolean>;

  expire(id: number): Promise<boolean>;

  keyFrom(dto: { location: string; date: string }): string;
}
