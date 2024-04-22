import request from "supertest";
import { Express } from "../../Infra/Express";
import { ERROR, SUCCESS, TEMPERATURE_RETRIEVED } from "../../Common/Messages";
import { HttpStatusCodeEnum } from "../../Common/Utils";
import ResetDb from "./Helpers/ResetDb";
import { prisma } from "./Helpers/ResetDb";
import { DateTime } from "luxon";
import { appConfig } from "../../Config";
import { SqliteCacheDriver } from "../../Services/Caching/SqliteCacheDriver";
import Database from "../../Infra/Database";

const app = new Express().app;

describe("API Integration Test", () => {
  beforeEach(async () => {
    await ResetDb();
  });

  it("should return weather data for a valid request", async () => {
    const response = await request(app)
      .post("/Search")
      .send({ location: "London", date: "2024-04-22" });

    if (response.statusCode !== HttpStatusCodeEnum.OK) {
      console.log("Test skipped because server did not return OK");

      return;
    }

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

      const response = await request(app)
        .post("/Search")
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

      const response = await request(app)
        .post("/Search")
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

      const response = await request(app)
        .post("/Search")
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

      const response = await request(app)
        .post("/Search")
        .send({ date: "2017-15-12", location: "NYC" });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        return;
      }

      const newCacheCount = await prisma.weatherCache.count();

      expect(cacheCount + 1).toEqual(newCacheCount);
    });

    it("should delete expired cache object", async () => {
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

      const response = await request(app)
        .post("/Search")
        .send({ location: "NYC", date: "2004-04-22" });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const newCache = await prisma.weatherCache.findFirst({
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
      let response = await request(app)
        .post("/Search")
        .send({ location: "NYC", date: "2004-04-22" });

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const startTime = performance.now();

      response = await request(app)
        .post("/Search")
        .send({ location: "NYC", date: "2004-04-22" });

      const endTime = performance.now();

      if (response.statusCode !== HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} skipped because server did not return OK`,
        );

        return;
      }

      const elapsedTime = endTime - startTime;

      const threshold = 100;

      expect(elapsedTime).toBeLessThan(threshold);
    });
  });

  describe("Error Handling", () => {
    it("should return an error if 3rd party service returns an error", async () => {
      let response = await request(app)
        .post("/Search")
        .send({ location: "NYC", date: "2004-04-22" });

      if (response.statusCode === HttpStatusCodeEnum.OK) {
        console.log(
          `${expect.getState().currentTestName} Test skipped because server returned OK`,
        );

        return;
      }

      expect(response.status).toBe(ERROR);
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
