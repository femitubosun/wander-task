mport { Processor } from "bullmq";
import { WanderWeatherApiClient } from "@/Infra/External/WanderWeatherApiClient";
import * as HttpClientModule from "@/Common/Utils/HttpClient";
import * as LoggerModule from "@/Common/Utils/Logger";
import { TemperatureConverter } from "@/Helpers/TemperatureConverter";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import * as DatabaseModule from "@/Infra/Database";

jest.mock("@/Infra/External/WanderWeatherApiClient");
jest.mock("@/Common/Utils/Logger");
jest.mock("@/Services/Caching/SqliteCacheDriver");

import func from "./your-function-file"; // Import the function to be tested

describe("Processor Function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call WanderWeatherApiClient.weatherSearch with correct arguments", async () => {
        const jobData = {
            date: "2024-04-23",
            location: "New York",
        };

        await func(jobData);

        expect(WanderWeatherApiClient.weatherSearch).toHaveBeenCalledWith({
            city: jobData.location,
            date: jobData.date,
        });
    });

    it("should log an error if WanderWeatherApiClient.weatherSearch returns an error", async () => {
        const errorMessage = "Some error occurred";
        WanderWeatherApiClient.weatherSearch.mockResolvedValueOnce({
            err: errorMessage,
            data: null,
        });

        await expect(func({ date: "2024-04-23", location: "New York" })).rejects.toThrow(
            "Could not Retry Failed Search Successfully"
        );
        expect(LoggerModule.Logger.error).toHaveBeenCalledWith("Search Retry Failed");
    });

    it("should call TemperatureConverter.convert with correct arguments", async () => {
        const jobData = {
            date: "2024-04-23",
            location: "New York",
        };
        const weatherData = { temperature: 20 };
        WanderWeatherApiClient.weatherSearch.mockResolvedValueOnce({
            err: null,
            data: weatherData,
        });

        await func(jobData);

        expect(TemperatureConverter.convert).toHaveBeenCalledWith(weatherData);
    });

    it("should call SqliteCacheDriver.set with correct arguments", async () => {
        const jobData = {
            date: "2024-04-23",
            location: "New York",
        };
        const weatherData = { temperature: 20 };
        const tempInfo = { temperature: 20, unit: "Celsius" };
        WanderWeatherApiClient.weatherSearch.mockResolvedValueOnce({
            err: null,
            data: weatherData,
        });

        await func(jobData);

        const cacheKey = new SqliteCacheDriver(DatabaseModule.default).keyFrom(jobData);
        expect(SqliteCacheDriver.prototype.keyFrom).toHaveBeenCalledWith(jobData);
        expect(SqliteCacheDriver.prototype.set).toHaveBeenCalledWith(cacheKey, JSON.stringify(tempInfo));
    });

    it("should log success message if search is completed successfully", async () => {
        const jobData = {
            date: "2024-04-23",
            location: "New York",
        };
        const weatherData = { temperature: 20 };
        WanderWeatherApiClient.weatherSearch.mockResolvedValueOnce({
            err: null,
            data: weatherData,
        });

        await func(jobData);

        expect(LoggerModule.Logger.info).toHaveBeenCalledWith("Failed Search Completed Successfully");
    });
});