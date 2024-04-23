import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import Database from "../../Infra/Database";
import { WeatherCacheObject } from "./WeatherCacheObject";
import { SqliteCacheDriver } from "./SqliteCacheDriver";
import { ICacheDriver } from "../../TypeChecking/Cache/ICacheDriver";

describe("SqliteCacheDriver", () => {
  let mockDatabase: DeepMockProxy<typeof Database>;
  let driver: ICacheDriver;

  beforeEach(() => {
    mockDatabase = mockDeep<typeof Database>();
    driver = new SqliteCacheDriver(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getActive", () => {
    it("should call findFirst with the correct value when it is called", async () => {
      const driver = new SqliteCacheDriver(mockDatabase);
      const key = "testKey";
      await driver.getActive(key);

      expect(mockDatabase.weatherCache.findFirst).toHaveBeenCalledWith({
        where: { cacheKey: key, isExpired: false },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return a WeatherCacheObject when it called with a valid key", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue({
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": 20, "fahrenheit": 40}',
        isExpired: false,
        createdAt: new Date(),
      });

      const result = await driver.getActive("testKey");

      expect(result).toBeInstanceOf(WeatherCacheObject);
    });

    it("should return null when findFirst returns null", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue(null);
      const result = await driver.getActive("testKey");

      expect(result).toBeNull();
    });

    it("it should return null if an error was thrown", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue(null);
      const result = await driver.getActive("testKey");

      expect(result).toBeNull();
    });
  });

  describe("getExpired", () => {
    it("should call findFirst with the correct value when it is called", async () => {
      const driver = new SqliteCacheDriver(mockDatabase);
      const key = "testKey";
      await driver.getExpired(key);

      expect(mockDatabase.weatherCache.findFirst).toHaveBeenCalledWith({
        where: { cacheKey: key, isExpired: true },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return a WeatherCacheObject when it called with a valid key", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue({
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": 20, "fahrenheit": 40}',
        isExpired: false,
        createdAt: new Date(),
      });

      const result = await driver.getExpired("testKey");

      expect(result).toBeInstanceOf(WeatherCacheObject);
    });

    it("should return null when findFirst returns null", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue(null);
      const result = await driver.getExpired("testKey");

      expect(result).toBeNull();
    });

    it("it should return null if an error was thrown", async () => {
      mockDatabase.weatherCache.findFirst.mockRejectedValue(new Error());
      const result = await driver.getExpired("testKey");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should call create with valid data when it is called", async () => {
      await driver.set("testKey", "testValue");

      expect(mockDatabase.weatherCache.create).toHaveBeenCalledWith({
        data: {
          cacheKey: "testKey",
          weatherData: "testValue",
        },
      });
    });

    it("should return true when executed correctly", async () => {
      const result = await driver.set("testKey", "testValue");

      expect(result).toBe(true);
    });

    it("should return false if create an error was thrown ", async () => {
      mockDatabase.weatherCache.create.mockRejectedValue(new Error());

      const result = await driver.set("testKey", "testValue");

      expect(result).toBe(false);
    });
  });

  describe("expire", () => {
    it("should update cache entry with the given key", async () => {
      const id = 1;

      await driver.expire(1);

      expect(mockDatabase.weatherCache.update).toHaveBeenCalledWith({
        where: {
          id,
        },
        data: {
          isExpired: true,
        },
      });
    });

    it("should return true when cache entry is successfully updated", async () => {
      const result = await driver.expire(1);

      expect(mockDatabase.weatherCache.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          isExpired: true,
        },
      });

      expect(result).toBe(true);
    });

    it("should return false when cache entry expiration fails", async () => {
      mockDatabase.weatherCache.update.mockRejectedValue(
        new Error("Delete error"),
      );

      const id = 1;
      const result = await driver.expire(id);

      expect(mockDatabase.weatherCache.update).toHaveBeenCalledWith({
        where: {
          id,
        },
        data: {
          isExpired: true,
        },
      });

      expect(result).toBe(false);
    });

    it("should delete existing expired cache entry if it exists ", async () => {
      mockDatabase.weatherCache.findFirst.mockResolvedValue({
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": 20, "fahrenheit": 40}',
        isExpired: false,
        createdAt: new Date(),
      });

      await driver.expire(2);

      expect(mockDatabase.weatherCache.delete).toHaveBeenCalled();
    });
  });

  describe("keyFrom", () => {
    it("should generate a cache key from location and date", () => {
      const options = { location: "New York", date: "2024-04-22" };
      const expectedKey = "newyork2024-04-22";

      const result = driver.keyFrom(options);

      expect(result).toEqual(expectedKey);
    });

    it("should generate a cache key with lowercase location", () => {
      const options = { location: "Los Angeles", date: "2024-04-22" };
      const expectedKey = "losangeles2024-04-22";

      const result = driver.keyFrom(options);

      expect(result).toEqual(expectedKey);
    });

    it("should generate a cache key with no spaces", () => {
      const options = { location: "San Francisco", date: "2024-04-22" };
      const expectedKey = "sanfrancisco2024-04-22";

      const result = driver.keyFrom(options);

      expect(result).toEqual(expectedKey);
    });
  });
});
