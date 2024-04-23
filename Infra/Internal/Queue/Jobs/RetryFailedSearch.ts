import { Processor } from "bullmq";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import HttpClient from "@/Common/Utils/HttpClient";
import { Logger } from "@/Common/Utils/Logger";
import { TemperatureConverter } from "@/Helpers/TemperatureConverter";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import Database from "@/Infra/Database";

const func: Processor = async (job: any): Promise<void> => {
  const { date, location } = job.data;

  const httpClient = new HttpClient();

  const { err, data } = await new WanderWeatherApiClient(
    httpClient,
  ).weatherSearch({
    city: location,
    date,
  });

  if (err !== null) {
    Logger.error("Search Retry Failed");

    throw new Error("Could not Retry Failed Search Successfully");
  }

  const tempInfo = TemperatureConverter.convert(data);

  const cacheDriver = new SqliteCacheDriver(Database);
  const cacheKey = cacheDriver.keyFrom({ location, date });

  await cacheDriver.set(cacheKey, JSON.stringify(tempInfo));

  Logger.info("Failed Search Completed Successfully");
};

export default func;
