import { CacheRow } from "@/TypeChecking/Cache/CacheRow";
import { appConfig } from "@/Config";
import { DateTime } from "luxon";
import { ICacheDriver } from "@/TypeChecking/Cache/ICacheDriver";

type WeatherCacheObjectOptions = {
  key: string;
  value: string;
  createdAt: string;
  cacheDriver: ICacheDriver;
};

export class WeatherCacheObject {
  constructor(private options: WeatherCacheObjectOptions) {}

  public hasExpired(): boolean {
    const currentDateTime = appConfig.CURRENT_DATE_TIME;

    const cacheExpirationOffset = currentDateTime.minus({
      minutes: appConfig.cacheConfig.EXPIRE_AFTER_MINUTES,
    });

    const cacheCreatedAt = DateTime.fromSeconds(Number(this.options.createdAt));

    return cacheCreatedAt < cacheExpirationOffset;
  }

  public async delete(): Promise<void> {
    await this.options.cacheDriver.delete(this.options.key);
  }

  public static fromRow(cacheDriver: ICacheDriver, key: string, row: CacheRow) {
    return new WeatherCacheObject({
      key,
      value: row.weather_data,
      createdAt: row.created_at,
      cacheDriver,
    });
  }

  public get data() {
    return JSON.parse(this.options.value);
  }
}
