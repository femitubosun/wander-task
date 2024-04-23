# Weather Search API

<!-- TOC -->

* [Weather Search API](#weather-search-api)
    * [Project Overview](#project-overview)
    * [Technologies](#technologies)
    * [Running the App](#running-the-app)
    * [Testing](#testing)
    * [Assumptions](#assumptions)
    * [Engineering Approach](#engineering-approach)
        * [Data Validation](#data-validation)
        * [Caching](#caching)
            * [Caching Middleware](#caching-middleware)
            * [SqliteCacheDriver](#sqlitecachedriver)
            * [Expiration](#expiration)
            * [Weather Cache Object](#weather-cache-object)
        * [Dependency Injection(DI)](#dependency-injectiondi)
        * [Prioritizes Availability over Accuracy](#prioritizes-availability-over-accuracy)
        * [Error Handling](#error-handling)
            * [Error Handling Table](#error-handling-table)
        * [Test Coverage](#test-coverage)

<!-- TOC -->

## Project Overview

## Technologies

* Typescript
* Express
* Sqlite3
* Prisma
* Third-Party API

## Running the App

* Clone the project `git clone`
* While the Docker Engine is running in your local machine, `docker compose up`

## Testing

* Run unit tests by running `npm run test`
* Run integration tests by running `npm run test:integration`

## Assumptions

* It was assumed that barring erratic errors, giving a valid date and the name of any city in the world(obscure or
  otherwise), the 3rd Party Service will return a valid response.
* Successful response from the 3rd-party API will always look like this:

```json
{
  "fahrenheit": 66.94
}
```

or

```json
{
  "celsius": 46.9
}
```

* The 3rd Party Service does not validate missing `city` parameter and will return a `500`.
* the 3rd Party Service will return `400` for dates in the future.

## Engineering Approach

### Data Validation

To minimize the errors from the 3rd Party Service, and eliminate error caused my bad input, data from the client is
validated.
Validation conditions are

1. `location` must be a valid string.
2. `location` must be a string of at least length `1`
3. `date` must be a valid string
4. `date` must be parsable as an ISO8601

### Caching

The caching system is a simple table on an SQLite database accessed through Prisma ORM. The cache table has the
following columns. `id` index assumed, an index for [cacheKey, isExpired] was created.

* id
* cacheKey
* weatherData
* isExpired
* createdAt

There can be at most two reference to a cacheKey, in the system. (a) A Valid Cache Data (b) An Expired Cache Data.
See [Availability Over Accuracy](#prioritizes-availability-over-accuracy)

#### Caching Middleware

The API handles caching on the middleware. The request only hits the controller if valid data does not exist in the
cache

#### SqliteCacheDriver

Abstraction over the ORM that exposes the following methods

* getActive
* getExpired
* set
* expire
* keyFrom

#### Expiration

The timeframe for cache expiration is configurable through the `.env` variable `CACHE_EXPIRE_AFTER_MINUTES`

#### Weather Cache Object

Data from the Database is abstracted away as `WeatherCacheObject`. Artifacts in the API interact with Cache data through
this object

### Dependency Injection(DI)

To increase the ease of testing the various components of the system, DI was utilized. However, to reduce complexity,
there's no Containerization. Dependencies are manually initialized and passed where they are needed.

### Prioritizes Availability over Accuracy

To improve Availability, the system retains expired Cache Data.
In the event that the 3rd-Party Service is unavailable but the expired result for the input parameters exists in the
cache, the API will return expired cache data, while adding a
message to notify the client. While this reduces data accuracy, notifying the client about the reduced accuracy makes it
a reasonable compormise.

```json

{
  "statusCode": 200,
  "status": "success",
  "message": "Temperature information retrieved, but data may be outdated. Please try again",
  "results": {
    "celsius": 34.9,
    "fahrenheit": 94.8
  }
}

```

### Error Handling

The 3rd Party Service being the center of the System is the source of the errors in the system. The approach to error
is inspired by the few bits I've picked up from learning Go in the past month. Interaction with the 3rd Party Service is
abstracted away as `WanderWeatherApiClient`. The object internally uses another abstraction--`HttpClient` to make
interact with
3rd Party API endpoint. `WanderWeatherApiClient` handles errors in its `#handleError` error method. It is responsible
for making sense of the response from the 3rd Party Service. The table below describes error types and how they are
handled

#### Error Handling Table

| Error Code                                                               | Description (from API response)               | How it's handled      | Returned Status Code | Returned Message                                                              |
|--------------------------------------------------------------------------|-----------------------------------------------|-----------------------|----------------------|-------------------------------------------------------------------------------|
| No response                                                              | No response from the server                   | Internal Server Error | 500                  | ERROR_PROCESSING_REQUEST_TRY_AGAIN                                            |
| 429 - Too Many Requests                                                  | User made too many requests in a short period | Too Many Requests     | 429                  | You are doing that too quickly. Please wait a few seconds before trying again |
| 418 - I'm a teapot (treated as internal server error)                    | -                                             | Internal Server Error | 500                  | ERROR_PROCESSING_REQUEST_TRY_AGAIN                                            |
| 500 - Internal Server Error (with 'invalid_date' in error message)       | Invalid date in request                       | Bad Request           | 400                  | Invalid Date. Check your input                                                |
| 500 - Internal Server Error (with '(reading 'length')' in error message) | Invalid location data in request              | Bad Request           | 400                  | Invalid Location. Check your input                                            |
| 400 - Bad Request                                                        | General bad request error from the API        | Bad Request           | 400                  | API error message (if available) or "Invalid Data. Please Check your input"   |
| Other 500 Errors                                                         | Unidentified Internal Server Error            | Internal Server Error | 500                  | ERROR_PROCESSING_REQUEST_TRY_AGAIN                                            |

Though some of these errors will not be encountered given the [Data Validation](#data-validation) in the System, I
think making Abstractions robust and agnostic is good practise.

As said in [Availability Over Accuracy](#prioritizes-availability-over-accuracy), if the 3rd party service returns an
error,
the System checks the Cache first for Expired Data. Barring that does it return the parsed error to the client.

### Test Coverage

| Test Type   | Coverage(%) |
|-------------|-------------|
| Unit        | 99.12       |
| Integration | 88.88       |