import {
    ERROR,
    OUTDATED_TEMPERATURE_RETRIEVED,
    NULL_OBJECT,
    SOMETHING_WENT_WRONG,
    SUCCESS,
    TEMPERATURE_RETRIEVED,
} from "@/Common/Messages";
import {HttpStatusCodeEnum} from "@/Common/Utils";
import {Logger} from "@/Common/Utils/Logger";
import {TemperatureConverter} from "@/Helpers/TemperatureConverter";
import {WanderWeatherApiClient} from "@/Infra/External/WanderWeatherApiClient";
import {SqliteCacheDriver} from "@/Services/Caching/SqliteCacheDriver";

import {Request, Response} from "express";
import Database from "@/Infra/Database";
import HttpClient from "@/Common/Utils/HttpClient";
import {QueueClient} from "@/Infra/Internal/Queue/Client";

class WeatherSearchController {
    public async handle(request: Request, response: Response) {
        try {
            const {location, date} = request.body;

            const httpClient = new HttpClient();
            const {err, data} = await new WanderWeatherApiClient(
                httpClient,
            ).weatherSearch({
                city: location,
                date,
            });

            const cacheDriver = new SqliteCacheDriver(Database);
            const cacheKey = cacheDriver.keyFrom({location, date});

            if (err !== NULL_OBJECT) {
                const THIRD_PARTY_SERVICE_ERRORS = [
                    HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
                ];

                if (err.statusCode in THIRD_PARTY_SERVICE_ERRORS) {
                    await QueueClient.failedSearch.addToQueue(location, date);
                }

                const expiredCache = await cacheDriver.getExpired(cacheKey);

                if (expiredCache !== NULL_OBJECT) {
                    return response.status(HttpStatusCodeEnum.OK).json({
                        statusCode: HttpStatusCodeEnum.OK,
                        status: SUCCESS,
                        message: OUTDATED_TEMPERATURE_RETRIEVED,
                        results: expiredCache.data,
                    });
                }

                return response.status(err.statusCode).json({
                    statusCode: err.statusCode,
                    status: ERROR,
                    message: err.message,
                });
            }

            const tempInfo = TemperatureConverter.convert(data);

            await cacheDriver.set(cacheKey, JSON.stringify(tempInfo));

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
