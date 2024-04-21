import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";

export interface ICacheDriver {
  get(key: string): Promise<WeatherCacheObject | null>;

  set(key: string, value: string): Promise<void>;

  delete(key: string): Promise<void>;

  keyFrom(dto: { location: string; date: string }): string;
}
