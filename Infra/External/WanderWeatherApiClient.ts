import { HttpStatusCodeEnum } from "@/Common/Utils";
import { BaseUtilityArtifact } from "@/Common/Utils/BaseUtilityArtifact";
import { HttpClient } from "@/Common/Utils/HttpClient";
import { appConfig } from "@/Config";
import { NULL_OBJECT } from "@/Common/Messages";
import { Logger } from "@/Common/Utils/Logger";

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
        statusCode: number;
        message?: string;
      };
      data: null;
    };

export class WanderWeatherApiClient extends BaseUtilityArtifact {
  public static async weatherSearch(
    weatherSearchDto: WeatherSearchDto,
  ): Promise<WeatherSearchReturnType> {
    try {
      const { apiResponse } = await HttpClient.post({
        endpointUrl: appConfig.WEATHER_API_URL,
        dataPayload: weatherSearchDto,
      });

      return {
        data: {
          temperature: Object.values(apiResponse)[0] as number,
          unit: Object.keys(apiResponse)[0] as "fahrenheit" | "celsius",
        },
        err: null,
      };
    } catch (error: any) {
      return this.#handleError(error);
    }
  }

  static #handleError(error: any) {
    Logger.error(error);

    if (error.response === NULL_OBJECT) {
      return {
        err: {
          statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
          message: "Internal Server Error",
        },
        data: null,
      };
    }

    const statusCode = error.response.status;
    const apiResponse = error.response;

    Logger.error(apiResponse);

    if (statusCode === HttpStatusCodeEnum.BAD_REQUEST) {
      return {
        err: {
          statusCode,
          message:
            apiResponse.data.error ?? "Invalid Data. Please Check your input",
        },
        data: null,
      };
    }

    if (statusCode === HttpStatusCodeEnum.TEA_POT) {
      return {
        err: {
          statusCode: 500,
          message: "Internal Server Error. Please try again Later",
        },
        data: null,
      };
    }

    if (
      error.response.status === HttpStatusCodeEnum.INTERNAL_SERVER_ERROR &&
      apiResponse.data.error.includes("invalid_date")
    ) {
      return {
        err: {
          statusCode: 400,
          message: "Invalid Date. Check your input",
        },
        data: null,
      };
    }

    if (
      error.response.status === HttpStatusCodeEnum.INTERNAL_SERVER_ERROR &&
      apiResponse.data.error.includes("(reading 'length')")
    ) {
      return {
        err: {
          statusCode: 400,
          message: "Invalid Location. Check your input",
        },
        data: null,
      };
    }

    return {
      err: {
        statusCode,
        message: "Internal Server Error. Please Try again later",
      },
      data: null,
    };
  }
}
