import { WanderWeatherApiClient } from "./WanderWeatherApiClient";
import { HttpClient } from "@/Common/Utils/HttpClient";
import { HttpStatusCodeEnum } from "@/Common/Utils";
import { ERROR_PROCESSING_REQUEST_TRY_AGAIN } from "@/Common/Messages";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

jest.mock("winston", () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
  }),
  format: {
    printf: jest.fn(),
    combine: jest.fn(),
    timestamp: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe("WanderWeatherApiClient", () => {
  let mockHttpClient: DeepMockProxy<HttpClient>;
  let weatherApiClient: WanderWeatherApiClient;

  beforeEach(() => {
    mockHttpClient = mockDeep<HttpClient>();

    weatherApiClient = new WanderWeatherApiClient(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return temperature and unit in data on successful executions response with temperature data", async () => {
    mockHttpClient.post.mockResolvedValue({
      statusCode: 200,
      apiResponse: { celsius: 20 },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "London",
      date: "2024-04-22",
    });

    expect(result.data).toHaveProperty("temperature");
    expect(result.data).toHaveProperty("unit");
  });

  it("should return error with status code 500 for unknown error", async () => {
    mockHttpClient.post.mockRejectedValue(new Error("Unknown error"));

    const result = await weatherApiClient.weatherSearch({
      city: "Ibadan",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
      },
      data: null,
    });
  });

  it("should return error with status code 400 for internal server error with invalid date message", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        data: { error: "invalid_date" },
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "Lagos",
      date: "2024-04-24T00:0x0:00.00",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        message: "Invalid Date. Check your input",
      },
      data: null,
    });
  });

  it("should return api error with status code 400 for invalid location", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        data: {
          error: "Cannot read properties of undefined (reading 'length')",
        },
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "Lagos",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        message: "Invalid Location. Check your input",
      },
      data: null,
    });
  });

  it("should return api error message for unknown 400 errors", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.BAD_REQUEST,
        data: {
          error: "Sample Error",
        },
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "Lagos",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        message: "Sample Error",
      },
      data: null,
    });
  });

  it("should return error with status code 429 for too many requests", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.TOO_MANY_REQUESTS,
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "London",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.TOO_MANY_REQUESTS,
        message:
          "You are doing that too quickly. Please wait a few seconds before trying again",
      },
      data: null,
    });
  });

  it("should return error with status code 500 for tea pot error", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.TEA_POT,
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "London",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
      },
      data: null,
    });
  });

  it("should return 'Invalid Data. Please Check your input' for unknown 400 errors", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.BAD_REQUEST,
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "London",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        message: "Invalid Data. Please Check your input",
      },
      data: null,
    });
  });

  it("should return 500 for unknown 500 errors", async () => {
    mockHttpClient.post.mockRejectedValue({
      response: {
        status: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
      },
    });

    const result = await weatherApiClient.weatherSearch({
      city: "London",
      date: "2024-04-22",
    });

    expect(result).toEqual({
      err: {
        statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        message: ERROR_PROCESSING_REQUEST_TRY_AGAIN,
      },
      data: null,
    });
  });
});
