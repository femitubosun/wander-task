import { Job, Processor } from "bullmq";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import HttpClient from "@/Common/Utils/HttpClient";
import { Logger } from "@/Common/Utils/Logger";
import { TemperatureConverter } from "@/Helpers/TemperatureConverter";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import Database from "@/Infra/Database";
import {
  RETRY_FAILED_SEARCH_FAILED,
  RETRY_FAILED_SEARCH_SUCCESSFUL,
} from "@/Common/Messages";

const job: Processor = async (job: Job): Promise<void> => {
  const { date, location } = job.data;

  const httpClient = new HttpClient();

  const { err, data } = await new WanderWeatherApiClient(
    httpClient,
  ).weatherSearch({
    city: location,
    date,
  });

  if (err !== null) {
    Logger.error(RETRY_FAILED_SEARCH_FAILED);

    throw new Error(RETRY_FAILED_SEARCH_FAILED);
  }

  const tempInfo = TemperatureConverter.convert(data);

  const cacheDriver = new SqliteCacheDriver(Database);
  const cacheKey = cacheDriver.keyFrom({ location, date });

  await cacheDriver.set(cacheKey, JSON.stringify(tempInfo));

  Logger.info(RETRY_FAILED_SEARCH_SUCCESSFUL);
};

export default job;
