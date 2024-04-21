import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";
import Database from "@/Infra/Database";
import { appConfig } from "@/Config";

import { CacheRow } from "@/TypeChecking/Cache/CacheRow";
import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";
import { Logger } from "@/Common/Utils/Logger";

export class SqliteCacheDriver implements ICacheDriver {
  public async get(key: string): Promise<WeatherCacheObject | null> {
    try {
      const result = await Database.cursor!.get<CacheRow>(
        `SELECT weather_data, created_at
           FROM ${appConfig.CACHE_TABLE_NAME}
           WHERE cache_key = ?`,
        key,
      );

      if (!result) return null;
      return WeatherCacheObject.fromRow(this, key, result);
    } catch (error: any) {
      Logger.error(error);
      return null;
    }
  }
  public async set(key: string, value: string): Promise<boolean> {
    try {
      const query = `
        INSERT INTO ${appConfig.CACHE_TABLE_NAME} (cache_key, weather_data)
        VALUES ('${key}', '${value}')
    `;
      await Database.cursor!.run(query);

      return true;
    } catch (error: any) {
      Logger.error(error);

      return false;
    }
  }

  public async delete(key: string) {
    try {
      const query = `
        DELETE FROM ${appConfig.CACHE_TABLE_NAME}
        WHERE cache_key = ?
    `;

      const result = await Database.cursor!.run(query, [key]);

      if (!result.changes || result.changes <= 0) {
        return false;
      }
      return false;
    } catch (error: any) {
      Logger.error(error);

      return false;
    }
  }

  public keyFrom(options: { location: string; date: string }) {
    return `${options.location.toLowerCase()}${options.date}`;
  }
}
