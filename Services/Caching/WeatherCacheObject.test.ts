import { DateTime } from "luxon";
import { WeatherCacheObject } from "./WeatherCacheObject";
import { ICacheDriver } from "../../TypeChecking/Cache/ICacheDriver";
import { CacheRow } from "../../TypeChecking/Cache/CacheRow";
import { mock } from "jest-mock-extended";

describe("WeatherCacheObject", () => {
  describe("hasExpired ", () => {
    it("should return true if cache has expired", () => {
      const cacheCreatedAt = DateTime.now().minus({ minutes: 61 });

      const mockCacheDriver = mock<ICacheDriver>();

      const cacheObject = new WeatherCacheObject({
        key: "testKey",
        value: "testValue",
        createdAt: cacheCreatedAt.toJSDate(),
        cacheDriver: mockCacheDriver,
      });

      expect(cacheObject.hasExpired()).toBe(true);
    });

    it("should return false if cache has not expired", () => {
      const cacheCreatedAt = DateTime.now().minus({ minutes: 59 });
      const mockCacheDriver = mock<ICacheDriver>();

      const cacheObject = new WeatherCacheObject({
        key: "testKey",
        value: "testValue",
        createdAt: cacheCreatedAt.toJSDate(),
        cacheDriver: mockCacheDriver,
      });

      expect(cacheObject.hasExpired()).toBe(false);
    });
  });

  describe("delete", () => {
    it("should call delete method on cache driver with correct key", async () => {
      const mockCacheDriver = mock<ICacheDriver>();

      const cacheObject = new WeatherCacheObject({
        key: "testKey",
        value: '{"celsius": -40, "fahrenheit": -40}',
        createdAt: new Date(),
        cacheDriver: mockCacheDriver,
      });

      await cacheObject.delete();

      expect(mockCacheDriver.delete).toHaveBeenCalledWith("testKey");
    });
  });

  describe("fromRow", () => {
    it("should create a WeatherCacheObject from a CacheRow", () => {
      const mockCacheDriver = mock<ICacheDriver>();

      const row: CacheRow = {
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": -40, "fahrenheit": -40}',
        createdAt: new Date(),
      };

      const cacheObject = WeatherCacheObject.fromRow(
        mockCacheDriver,
        "testKey",
        row,
      );

      expect(cacheObject).toBeInstanceOf(WeatherCacheObject);
      expect(cacheObject.data).toEqual({
        celsius: -40,
        fahrenheit: -40,
      });
    });
  });

  describe("data", () => {
    it("should return correct temperature object when data is called", () => {
      const mockCacheDriver = mock<ICacheDriver>();

      const row: CacheRow = {
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": -40, "fahrenheit": -40}',
        createdAt: new Date(),
      };

      const cacheObject = WeatherCacheObject.fromRow(
        mockCacheDriver,
        "testKey",
        row,
      );

      expect(cacheObject.data).toHaveProperty("fahrenheit");
      expect(cacheObject.data).toHaveProperty("celsius");
      expect(cacheObject.data.fahrenheit).toBe(-40);
      expect(cacheObject.data.celsius).toBe(-40);
    });
  });
});
