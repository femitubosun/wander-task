import { HttpStatusCodeEnum } from "@/Common/Utils";
import { BaseUtilityArtifact } from "@/Common/Utils/BaseUtilityArtifact";
import { HttpClient } from "@/Common/Utils/HttpClient";
import { appConfig } from "@/Config";
import { HttpStatusCode } from "axios";

type WeatherSearchDto = {
  city: string;
  date: string;
};

type WeatherSearchReturnType =
  | {
      data: {
        unit: "fahrenheit" | "celsius";
        temperature: number;
      };
      err: null;
    }
  | {
      err: {
        errorType: "rateLimit" | "unknown" | "badRequest";
        statusCode: number;
      };
      data: null;
    };

/**
 * Wrapper around Wander API
 */
export class WanderWeatherApiClient extends BaseUtilityArtifact {
  public static async weatherSearch(
    weatherSearchDto: WeatherSearchDto,
  ): Promise<WeatherSearchReturnType> {
    try {
      const { statusCode, apiResponse } = await HttpClient.post({
        endpointUrl: appConfig.WEATHER_API_URL,
        dataPayload: weatherSearchDto,
      });

      console.log(apiResponse);

      return {
        data: {
          temperature: Object.values(apiResponse)[0] as number,
          unit: Object.keys(apiResponse)[0] as "fahrenheit" | "celsius",
        },
        err: null,
      };
    } catch (error: any) {
      this.LogError(error);
      const statusCode: number =
        error.response.status || HttpStatusCode.InternalServerError;

      console.log(error.response.message);

      return {
        err: {
          errorType: this.#getErrorType(statusCode),
          statusCode,
        },
        data: null,
      };
    }
  }

  static #getErrorType(errorCode: number) {
    if (errorCode == HttpStatusCodeEnum.TOO_MANY_REQUESTS) {
      return "rateLimit";
    }

    return "unknown";
  }
}
