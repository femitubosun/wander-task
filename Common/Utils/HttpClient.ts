import axios from "axios";

type RequestPayloadOptionsInterface = {
  /**
   * The Request Endpoint
   */
  endpointUrl: string;

  /**
   * The Data Packet to be sent
   */
  dataPayload?: Record<string, any>;

  /**
   * The Additional Headers Data [Optional]
   */
  headerOptions?: {
    headers: {};
  };
};

/*
|--------------------------------------------------------------------------
| An internal abstraction on the HTTP Client package in use which is
| currently axios. This provides a consistent internal HTTP client interface
| to be used within the Application
|--------------------------------------------------------------------------
|
*/
export class HttpClient {
  /**
   * @description The POST method for making authorized/unauthorized requests
   * @param {RequestPayloadOptionsInterface} postRequestPayloadOptions
   * @returns {*}  {Promise<{ statusCode: number; apiResponse: any }>}
   * @memberof HttpClient
   */
  public async post(
    postRequestPayloadOptions: RequestPayloadOptionsInterface,
  ): Promise<{ statusCode: number; apiResponse: any }> {
    const { endpointUrl, dataPayload, headerOptions } =
      postRequestPayloadOptions;

    const { status: statusCode, data: apiResponse } = await axios.post(
      endpointUrl,
      dataPayload,
      headerOptions,
    );

    return { statusCode, apiResponse };
  }
}

export default HttpClient;
