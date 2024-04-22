import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";
import Database from "@/Infra/Database";
import { appConfig } from "@/Config";

import { CacheRow } from "@/TypeChecking/Cache/CacheRow";
import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";
import { Logger } from "@/Common/Utils/Logger";
import * as console from "node:console";

export class SqliteCacheDriver implements ICacheDriver {
  public async get(key: string): Promise<WeatherCacheObject | null> {
    try {
      const result = await Database.weatherCache!.findUnique({
        where: { cacheKey: key },
      });

      if (!result) return null;

      return WeatherCacheObject.fromRow(this, key, result);
    } catch (error: any) {
      Logger.error(error);
      return null;
    }
  }

  public async set(key: string, value: string): Promise<boolean> {
    try {
      const res = await Database.weatherCache.create({
        data: {
          cacheKey: key,
          weatherData: value,
        },
      });

      if (!res) return false;

      return true;
    } catch (error: any) {
      Logger.error(error);

      return false;
    }
  }

  public async delete(key: string) {
    try {
      const result = await Database.weatherCache.delete({
        where: {
          cacheKey: key,
        },
      });

      return true;
    } catch (error: any) {
      Logger.error(error);

      return false;
    }
  }

  public keyFrom(options: { location: string; date: string }) {
    return `${options.location.toLowerCase()}${options.date}`;
  }
}
