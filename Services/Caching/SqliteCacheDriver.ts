import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";
import Database from "@/Infra/Database";
import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";
import { Logger } from "@/Common/Utils/Logger";

export class SqliteCacheDriver implements ICacheDriver {
  constructor(private databaseDriver: typeof Database) {}

  public async get(key: string): Promise<WeatherCacheObject | null> {
    try {
      const result = await this.databaseDriver.weatherCache!.findUnique({
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
      await this.databaseDriver.weatherCache.create({
        data: {
          cacheKey: key,
          weatherData: value,
        },
      });

      return true;
    } catch (error: any) {
      Logger.error(error);

      return false;
    }
  }

  public async delete(key: string) {
    try {
      await this.databaseDriver.weatherCache.delete({
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
    const cleanedLocation = options.location.replace(/\s/g, "").toLowerCase();
    return `${cleanedLocation}${options.date}`;
  }
}
