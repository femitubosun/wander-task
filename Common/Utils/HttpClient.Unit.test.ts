import axios from "axios";
import { HttpClient } from "./HttpClient";

jest.mock("axios");

describe("HttpClient Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should make a POST request with provided payload and headers", async () => {
    const endpointUrl = "https://example.com/api";
    const dataPayload = { key: "value" };
    const headerOptions = { headers: { Authorization: "Bearer token" } };
    const expectedResponse = {
      statusCode: 200,
      apiResponse: { message: "Success" },
    };

    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: expectedResponse.statusCode,
      data: expectedResponse.apiResponse,
    });

    const httpClient = new HttpClient();
    const response = await httpClient.post({
      endpointUrl,
      dataPayload,
      headerOptions,
    });

    expect(axios.post).toHaveBeenCalledWith(
      endpointUrl,
      dataPayload,
      headerOptions,
    );
    expect(response).toEqual(expectedResponse);
  });

  it("should make a POST request with provided payload and without headers", async () => {
    const endpointUrl = "https://example.com/api";
    const dataPayload = { key: "value" };
    const expectedResponse = {
      statusCode: 200,
      apiResponse: { message: "Success" },
    };

    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: expectedResponse.statusCode,
      data: expectedResponse.apiResponse,
    });

    const httpClient = new HttpClient();
    const response = await httpClient.post({ endpointUrl, dataPayload });

    expect(axios.post).toHaveBeenCalledWith(
      endpointUrl,
      dataPayload,
      undefined,
    );
    expect(response).toEqual(expectedResponse);
  });

  it("should throw an error if axios.post rejects", async () => {
    const endpointUrl = "https://example.com/api";
    const dataPayload = { key: "value" };
    const error = new Error("Request failed");

    (axios.post as jest.Mock).mockRejectedValueOnce(error);

    const httpClient = new HttpClient();

    await expect(httpClient.post({ endpointUrl, dataPayload })).rejects.toThrow(
      error,
    );
  });
});
