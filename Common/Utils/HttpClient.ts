import axios from "axios";

type RequestPayloadOptionsInterface = {
  /**
   * The Request Endpoint
   */
  endpointUrl: string;

  /**
   * The Data Packet to be sent
   */
  dataPayload?: object;

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
   * @description The GET method for making authorized/unauthorized requests
   * @param {RequestPayloadOptionsInterface} getRequestPayloadOptions
   * @returns {*}  {Promise<{ statusCode: number; apiResponse: any }>}
   * @memberof HttpClient
   */
  public async get(
    getRequestPayloadOptions: RequestPayloadOptionsInterface,
  ): Promise<{ statusCode: number; apiResponse: any }> {
    const { endpointUrl, headerOptions } = getRequestPayloadOptions;
    const { status: statusCode, data: apiResponse } = await axios.get(
      endpointUrl,
      headerOptions,
    );

    return { statusCode, apiResponse };
  }

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

  /**
   * @description The PUT method for making authorized/unauthorized requests
   * @param {RequestPayloadOptionsInterface} putRequestPayloadOptions
   * @returns {*}  {Promise<{ statusCode: number; apiResponse: any }>}
   * @memberof HttpClient
   */
  public async put(
    putRequestPayloadOptions: RequestPayloadOptionsInterface,
  ): Promise<{ statusCode: number; apiResponse: any }> {
    const { endpointUrl, dataPayload, headerOptions } =
      putRequestPayloadOptions;
    const { status: statusCode, data: apiResponse } = await axios.put(
      endpointUrl,
      dataPayload,
      headerOptions,
    );

    return { statusCode, apiResponse };
  }

  /**
   * @description The PATCH method for making authorized/unauthorized requests
   * @param {RequestPayloadOptionsInterface} patchRequestPayloadOptions
   * @returns {*}  {Promise<{ statusCode: number; apiResponse: any }>}
   * @memberof HttpClient
   */
  public async patch(
    patchRequestPayloadOptions: RequestPayloadOptionsInterface,
  ): Promise<{ statusCode: number; apiResponse: any }> {
    const { endpointUrl, dataPayload, headerOptions } =
      patchRequestPayloadOptions;
    const { status: statusCode, data: apiResponse } = await axios.patch(
      endpointUrl,
      dataPayload,
      headerOptions,
    );

    return { statusCode, apiResponse };
  }

  /** @description The HEAD method for making head request
   *  @param {RequestPayloadOptionsInterface} headRequestPayloadOptions
   *  @returns {Record<string, any>}
   *  @memberof HttpClient
   */
  public async head(headRequestPayloadOptions: RequestPayloadOptionsInterface) {
    const { endpointUrl } = headRequestPayloadOptions;

    const response = await axios.head(endpointUrl);

    return response.headers;
  }
}

export default HttpClient;
