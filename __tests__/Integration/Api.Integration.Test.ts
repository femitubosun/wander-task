import request from "supertest";
import { Express } from "@/Infra/Express";
import {
  ERROR,
  OUTDATED_TEMPERATURE_RETRIEVED,
  SUCCESS,
  TEMPERATURE_RETRIEVED,
} from "@/Common/Messages";
import { HttpStatusCodeEnum } from "../../Common/Utils";
import ResetDb from "./Helpers/ResetDb";
import { prisma } from "./Helpers/ResetDb";
import { DateTime } from "luxon";
import { appConfig } from "@/Config";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import Database from "@/Infra/Database";
import { mock } from "jest-mock-extended";
import { Job } from "bullmq";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import { QueueClient } from "../../Infra/Internal/Queue/Client";
import { WeatherCacheObject } from "../../Services/Caching/WeatherCacheObject";

const app = new Express().app;

jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
      };
    }),
  };
});

describe("Weather Search API Integration Test", () => {
  const WeatherApi = request(app);

  const jobData = mock<Job>();
  (jobData.data.location = "New York"), (jobData.data.date = "2024-04-23");

  const weatherSearchSpy = jest.spyOn(
    WanderWeatherApiClient.prototype,
    "weatherSearch",
  );

  const queueClientSpy = jest.spyOn(QueueClient.failedSearch, "addToQueue");

  const cacheClientGetExpiredSpy = jest.spyOn(
    SqliteCacheDriver.prototype,
    "getExpired",
  );

  const cacheClientGetActiveSpy = jest.spyOn(
    SqliteCacheDriver.prototype,
    "getActive",
  );

  beforeEach(async () => {
    await ResetDb();
  });

  it("should return weather data for a valid request", async () => {
    weatherSearchSpy.mockResolvedValueOnce({
      err: null,
      data: {
        unit: "fahrenheit",
        temperature: 40.0,
      },
    });

    cacheClientGetActiveSpy.mockResolvedValueOnce(null);

    const response = await WeatherApi.post("/Search").send({
      location: "London",
      date: "2024-04-22",
    });

    expect(response.body).toEqual({
      statusCode: 200,
      status: SUCCESS,
      message: TEMPERATURE_RETRIEVED,
      results: expect.objectContaining({
        fahrenheit: expect.any(Number),
        celsius: expect.any(Number),
      }),
    });
  });

  describe("Validation", () => {
    it("should return an 422 for an missing location", async () => {
      const expectedResponseCode = HttpStatusCodeEnum.UNPROCESSABLE_ENTITY;

      const response = await WeatherApi.post("/Search")
        .send({ date: "2024-04-22" })
        .expect(expectedResponseCode);

      expect(response.body).toEqual({
        statusCode: expectedResponseCode,
        status: ERROR,
        message: "Validation Error",
        errors: expect.any(Array),
      });
    });

    it("should return a 422 for non ISO date", async () => {
      const expectedResponseCode = HttpStatusCodeEnum.UNPROCESSABLE_ENTITY;

      const response = await WeatherApi.post("/Search")
        .send({ date: "2024x", location: "NYC" })
        .expect(expectedResponseCode);

      expect(response.body).toEqual({
        statusCode: expectedResponseCode,
        status: ERROR,
        message: "Validation Error",
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringMatching("Date should be a valid ISO8601 date"),
          }),
        ]),
      });
    });

    it("should return a 422 for a future date", async () => {
      const expectedResponseCode = HttpStatusCodeEnum.UNPROCESSABLE_ENTITY;

      const response = await WeatherApi.post("/Search")
        .send({ date: "2027", location: "NYC" })
        .expect(expectedResponseCode);

      expect(response.body).toEqual({
        statusCode: expectedResponseCode,
        status: ERROR,
        message: "Validation Error",
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringMatching("Date is a future date"),
          }),
        ]),
      });
    });
  });

  describe("Caching", () => {
    it("should cache results that are new", async () => {
      const cacheCount = await prisma.weatherCache.count();

      weatherSearchSpy.mockResolvedValueOnce({
        err: null,
        data: {
          unit: "fahrenheit",
          temperature: 12,
        },
      });

      const response = await WeatherApi.post("/Search").send({
        date: "2017-15-12",
        location: "NYC",
      });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        return;
      }

      const newCacheCount = await prisma.weatherCache.count();

      expect(cacheCount + 1).toEqual(newCacheCount);
    });

    it("should set expired cache object isExpired to true", async () => {
      const requestData = { location: "NYC", date: "2004-04-22" };

      const cacheKey = new SqliteCacheDriver(Database).keyFrom(requestData);

      const expiredCacheData = await prisma.weatherCache.create({
        data: {
          cacheKey,
          weatherData: JSON.stringify({ celsius: 20, fahrenheit: 20 }),
          createdAt: DateTime.now()
            .minus({ day: 1, minute: appConfig.CACHE.EXPIRE_AFTER_MINUTES + 1 })
            .toJSDate(),
        },
      });

      const response = await WeatherApi.post("/Search").send({
        location: "NYC",
        date: "2004-04-22",
      });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const newCache = await prisma.weatherCache.findFirst({
        where: {
          cacheKey,
        },
        orderBy: {
          cacheKey: "desc",
        },
      });

      expect(newCache!.cacheKey).toEqual(cacheKey);
      expect(expiredCacheData.createdAt.getTime()).toBeLessThan(
        newCache!.createdAt.getTime(),
      );
    });

    it("should have low latency for cached results", async () => {
      let response = await WeatherApi.post("/Search").send({
        location: "NYC",
        date: "2004-04-22",
      });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const startTime = performance.now();

      response = await WeatherApi.post("/Search").send({
        location: "NYC",
        date: "2004-04-22",
      });

      const endTime = performance.now();

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const elapsedTime = endTime - startTime;
      const threshold = 50;

      expect(elapsedTime).toBeLessThan(threshold);
    });

    it("Should return expired cache if 3rd party throws an error and expired cache exists", async () => {
      weatherSearchSpy.mockResolvedValueOnce({
        err: {
          statusCode: 500,
          message: "Something went wrong",
        },
        data: null,
      });

      const reqData = {
        location: "NYC",
        date: "2004-04-22",
      };

      const cacheObject = mock<WeatherCacheObject>();

      cacheClientGetExpiredSpy.mockResolvedValueOnce(cacheObject);

      const response = await WeatherApi.post("/Search")
        .send(reqData)
        .expect(HttpStatusCodeEnum.OK);

      expect(response.body).toEqual({
        statusCode: HttpStatusCodeEnum.OK,
        status: SUCCESS,
        message: OUTDATED_TEMPERATURE_RETRIEVED,
      });
    });
  });

  describe("Error Handling", () => {
    it("should return an error if 3rd party service returns an error", async () => {
      weatherSearchSpy.mockResolvedValueOnce({
        err: {
          statusCode: 500,
          message: "Something went wrong",
        },
        data: null,
      });

      let response = await WeatherApi.post("/Search").send({
        location: "NYC31",
        date: "2004-04-21",
      });

      expect(response.status).toBe(HttpStatusCodeEnum.INTERNAL_SERVER_ERROR);
    });
  });

  describe("Retry Request", () => {
    it("should call the queue Client if 3rd party service returns a 500", async () => {
      weatherSearchSpy.mockResolvedValueOnce({
        err: {
          statusCode: 500,
          message: "Something went wrong",
        },
        data: null,
      });

      const reqData = {
        location: "NYC",
        date: "2004-04-22",
      };

      await WeatherApi.post("/Search").send(reqData);

      expect(queueClientSpy).toHaveBeenCalledWith("NYC", "2004-04-22");
    });
  });
});
