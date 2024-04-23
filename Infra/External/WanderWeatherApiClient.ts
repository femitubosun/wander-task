import { HttpStatusCodeEnum } from "@/Common/Utils";
import { HttpClient } from "@/Common/Utils/HttpClient";
import { appConfig } from "@/Config";
import { ERROR_PROCESSING_REQUEST_TRY_AGAIN } from "@/Common/Messages";
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

export class WanderWeatherApiClient {
  constructor(private httpClient: HttpClient) {}

  public async weatherSearch(
    weatherSearchDto: WeatherSearchDto
  ): Promise<WeatherSearchReturnType> {
    try {
      const { apiResponse } = await this.httpClient.post({
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

  #handleError(error: any) {
    Logger.error(error);

    if (!error.response) {
      return {
        err: {
          statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
          message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
        },
        data: null,
      };
    }

    const statusCode = error.response.status;
    const apiResponse = error.response;

    Logger.error(apiResponse);

    if (statusCode === HttpStatusCodeEnum.TOO_MANY_REQUESTS) {
      return {
        err: {
          statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
          message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
        },
        data: null,
      };
    }

    if (statusCode === HttpStatusCodeEnum.TEA_POT) {
      return {
        err: {
          statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
          message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
        },
        data: null,
      };
    }

    if (
      statusCode === HttpStatusCodeEnum.INTERNAL_SERVER_ERROR &&
      apiResponse.data?.error?.includes("invalid_date")
    ) {
      return {
        err: {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          message: "Invalid Date. Check your input",
        },
        data: null,
      };
    }

    if (
      statusCode === HttpStatusCodeEnum.INTERNAL_SERVER_ERROR &&
      apiResponse.data?.error?.includes("(reading 'length')")
    ) {
      return {
        err: {
          statusCode: 400,
          message: "Invalid Location. Check your input",
        },
        data: null,
      };
    }

    if (statusCode === HttpStatusCodeEnum.BAD_REQUEST) {
      return {
        err: {
          statusCode,
          message:
            apiResponse.data?.error ?? "Invalid Data. Please Check your input",
        },
        data: null,
      };
    }

    return {
      err: {
        statusCode,
        message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
      },
      data: null,
    };
  }
}
