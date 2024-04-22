import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";
import Database from "@/Infra/Database";
import { WeatherCacheObject } from "@/Services/Caching/WeatherCacheObject";
import { Logger } from "@/Common/Utils/Logger";

export class SqliteCacheDriver implements ICacheDriver {
  constructor(private databaseDriver: typeof Database) {}

  public async getActive(key: string): Promise<WeatherCacheObject | null> {
    try {
      const result = await this.databaseDriver.weatherCache!.findFirst({
        where: { cacheKey: key, isExpired: false },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!result) return null;

      return WeatherCacheObject.fromRow(this, key, result);
    } catch (error: any) {
      Logger.error(error);
      return null;
    }
  }

  public async getExpired(key: string): Promise<WeatherCacheObject | null> {
    try {
      const result = await this.databaseDriver.weatherCache!.findFirst({
        where: { cacheKey: key, isExpired: true },
        orderBy: {
          createdAt: "desc",
        },
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

  public async expire(id: number) {
    try {
      const oldestExpired = await this.databaseDriver.weatherCache.findFirst({
        where: {
          id,
          isExpired: true,
        },
      });

      if (oldestExpired) {
        await this.databaseDriver.weatherCache.delete({
          where: {
            id: oldestExpired.id,
          },
        });
      }

      await this.databaseDriver.weatherCache.update({
        where: {
          id,
        },
        data: {
          isExpired: true,
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
