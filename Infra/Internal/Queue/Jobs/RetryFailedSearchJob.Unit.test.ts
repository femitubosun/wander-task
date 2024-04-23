import { mock } from "jest-mock-extended";
import { Job } from "bullmq";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import ResetDb from "@/__tests__/Integration/Helpers/ResetDb";
import RetryFailedSearchJob from "./RetryFailedSearchJob";
import { RETRY_FAILED_SEARCH_FAILED } from "@/Common/Messages";

describe("Retry Failed Search API Test", () => {
  const jobData = mock<Job>();
  (jobData.data.location = "New York"), (jobData.data.date = "2024-04-23");

  const weatherSearchSpy = jest.spyOn(
    WanderWeatherApiClient.prototype,
    "weatherSearch",
  );

  const cacheDriverSpy = jest.spyOn(SqliteCacheDriver.prototype, "set");

  beforeEach(async () => {
    await ResetDb();
  });

  it("should call weatherSearch method of WanderWeatherApiClient", async () => {
    weatherSearchSpy.mockResolvedValueOnce({
      err: null,
      data: { temperature: 20, unit: "fahrenheit" },
    });

    await RetryFailedSearchJob(jobData);

    expect(weatherSearchSpy).toHaveBeenCalledWith({
      city: "New York",
      date: "2024-04-23",
    });
  });

  it("should throw an error if the WanderWeatherApiClient returns an error", async () => {
    weatherSearchSpy.mockResolvedValueOnce({
      err: {
        statusCode: 500,
        message: "Something went wrong",
      },
      data: null,
    });

    await expect(RetryFailedSearchJob(jobData)).rejects.toThrow(
      new Error(RETRY_FAILED_SEARCH_FAILED),
    );
  });

  it("should set data in cache if the 3rd party service executes successfully", async () => {
    weatherSearchSpy.mockResolvedValueOnce({
      err: null,
      data: { temperature: 20, unit: "fahrenheit" },
    });

    await RetryFailedSearchJob(jobData);

    expect(cacheDriverSpy).toHaveBeenCalled();
  });
});
