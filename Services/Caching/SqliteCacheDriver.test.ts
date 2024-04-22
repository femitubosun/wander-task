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

  describe("get", () => {
    it("should call findUnique with the correct value when it is called", async () => {
      const driver = new SqliteCacheDriver(mockDatabase);
      await driver.get("testKey");

      expect(mockDatabase.weatherCache.findUnique).toHaveBeenCalledWith({
        where: { cacheKey: "testKey" },
      });
    });

    it("should return a WeatherCacheObject when it called with a valid key", async () => {
      mockDatabase.weatherCache.findUnique.mockResolvedValue({
        id: 1,
        cacheKey: "testKey",
        weatherData: '{"celsius": 20, "fahrenheit": 40}',
        createdAt: new Date(),
      });

      const result = await driver.get("testKey");

      expect(result).toBeInstanceOf(WeatherCacheObject);
    });

    it("should return null when findUnique returns null", async () => {
      mockDatabase.weatherCache.findUnique.mockResolvedValue(null);
      const result = await driver.get("testKey");

      expect(result).toBeNull();
    });

    it("it should return null if an error was thrown", async () => {
      mockDatabase.weatherCache.findUnique.mockRejectedValue(new Error());
      const result = await driver.get("testKey");

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

  describe("delete", () => {
    it("should delete cache entry with the given key", async () => {
      const key = "testKey";

      await driver.delete(key);

      expect(mockDatabase.weatherCache.delete).toHaveBeenCalledWith({
        where: {
          cacheKey: key,
        },
      });
    });

    it("should return true when cache entry is successfully deleted", async () => {
      const key = "testKey";

      // Call the delete method
      const result = await driver.delete(key);

      // Verify that delete method of weatherCache was called
      expect(mockDatabase.weatherCache.delete).toHaveBeenCalled();
      // Verify that it returns true
      expect(result).toBe(true);
    });

    it("should return false when cache entry deletion fails", async () => {
      mockDatabase.weatherCache.delete.mockRejectedValue(
        new Error("Delete error"),
      );

      const key = "testKey";
      const result = await driver.delete(key);

      expect(mockDatabase.weatherCache.delete).toHaveBeenCalled();

      expect(result).toBe(false);
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
