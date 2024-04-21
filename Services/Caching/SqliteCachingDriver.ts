import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";
import Database from "@/Infra/Database";
import { appConfig } from "@/Config";

import { CacheRow } from "@/TypeChecking/Cache/CacheRow";
import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";

export class SqliteCachingDriver implements ICacheDriver {
  public async get(key: string): Promise<WeatherCacheObject | null> {
    const result = await Database.cursor!.get<CacheRow>(
      `SELECT weather_data, created_at FROM ${appConfig.CACHE_TABLE_NAME} WHERE cache_key = ?`,
      key,
    );

    if (!result) return null;

    return WeatherCacheObject.fromRow(this, key, result);
  }
  public async set(key: string, value: string): Promise<void> {
    const query = `
        INSERT INTO ${appConfig.CACHE_TABLE_NAME} (cache_key, weather_data)
        VALUES ('${key}', '${value}')
    `;
    await Database.cursor!.run(query);
  }

  public async delete(key: string) {
    const query = `
        DELETE FROM ${appConfig.CACHE_TABLE_NAME}
        WHERE cache_key = ?
    `;

    const result = await Database.cursor!.run(query, [key]);

    if (!result.changes) {
      console.log("No data found to delete for key");
      return;
    }

    if (result.changes > 0) {
      console.log("Data deleted successfully.");
    } else {
      console.log("No data found to delete for the key:", key);
    }
  }

  public keyFrom(options: { location: string; date: string }) {
    return `${options.location.toLowerCase()}${options.date}`;
  }
}
