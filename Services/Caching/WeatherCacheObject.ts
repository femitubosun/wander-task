import { CacheRow } from "@/TypeChecking/Cache/CacheRow";
import { appConfig } from "@/Config";
import { DateTime } from "luxon";
import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";

type WeatherCacheObjectOptions = {
  id: number;
  key: string;
  value: string;
  isExpired: boolean;
  createdAt: Date;
  cacheDriver: ICacheDriver;
};

export class WeatherCacheObject {
  constructor(private options: WeatherCacheObjectOptions) {}

  public hasExpired(): boolean {
    const currentDateTime = appConfig.CURRENT_DATE_TIME;

    const cacheExpirationOffset = currentDateTime.minus({
      minutes: appConfig.CACHE.EXPIRE_AFTER_MINUTES,
    });

    const cacheCreatedAt = DateTime.fromJSDate(this.options.createdAt);

    return cacheCreatedAt < cacheExpirationOffset;
  }

  public async expire(): Promise<void> {
    await this.options.cacheDriver.expire(this.options.id);
  }

  public static fromRow(cacheDriver: ICacheDriver, key: string, row: CacheRow) {
    return new WeatherCacheObject({
      key,
      id: row.id,
      value: row.weatherData,
      createdAt: row.createdAt,
      isExpired: row.isExpired,
      cacheDriver,
    });
  }

  public get data() {
    return JSON.parse(this.options.value);
  }
}
