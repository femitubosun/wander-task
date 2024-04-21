import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";

export interface ICacheDriver {
  get(key: string): Promise<WeatherCacheObject | null>;

  set(key: string, value: string): Promise<boolean>;

  delete(key: string): Promise<boolean>;

  keyFrom(dto: { location: string; date: string }): string;
}
