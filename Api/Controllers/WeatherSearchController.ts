import {
  ERROR,
  SOMETHING_WENT_WRONG,
  SUCCESS,
  TEMPERATURE_RETRIEVED,
} from "@/Common/Messages";
import { HttpStatusCodeEnum } from "@/Common/Utils";
import { Logger } from "@/Common/Utils/Logger";
import { TemperatureConverter } from "@/Helpers/TemperatureConverter";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";

import { Request, Response } from "express";

class WeatherSearchController {
  public async handle(request: Request, response: Response) {
    try {
      const { location, date } = request.body;

      Logger.debug({ location, date });

      const { err, data } = await WanderWeatherApiClient.weatherSearch({
        city: location,
        date,
      });

      if (err !== null) {
        return response.status(err.statusCode).json({
          statusCode: err.statusCode,
          status: ERROR,
          message: err.message,
        });
      }

      const tempInfo = TemperatureConverter.convert(data);

      const cacheDriver = new SqliteCacheDriver();

      await cacheDriver.set(
        cacheDriver.keyFrom({
          date,
          location,
        }),
        JSON.stringify(tempInfo),
      );

      return response.status(HttpStatusCodeEnum.OK).json({
        statusCode: HttpStatusCodeEnum.OK,
        status: SUCCESS,
        message: TEMPERATURE_RETRIEVED,
        results: tempInfo,
      });
    } catch (error: any) {
      Logger.error(error);

      return response.status(HttpStatusCodeEnum.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        status: ERROR,
        message: SOMETHING_WENT_WRONG,
      });
    }
  }
}

export default new WeatherSearchController();
