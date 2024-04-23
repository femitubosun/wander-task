import { TemperatureConverter } from "./TemperatureConverter";

describe("TemperatureConverter", () => {
  describe("convert", () => {
    it("should convert from Celsius to Fahrenheit correctly", () => {
      const result = TemperatureConverter.convert({
        temperature: 0,
        unit: "celsius",
      });

      expect(result.fahrenheit).toBe(32);
    });

    it("should convert from Fahrenheit to Celsius correctly", () => {
      const result = TemperatureConverter.convert({
        temperature: 32,
        unit: "fahrenheit",
      });
      expect(result.celsius).toBe(0);
    });

    it("should handle negative Celsius temperatures correctly", () => {
      const result = TemperatureConverter.convert({
        temperature: -40,
        unit: "celsius",
      });
      expect(result.fahrenheit).toBe(-40);
    });

    it("should handle negative Fahrenheit temperatures correctly", () => {
      const result = TemperatureConverter.convert({
        temperature: -40,
        unit: "fahrenheit",
      });
      expect(result.celsius).toBe(-40);
    });

    it("should return the same value for Celsius if already in Celsius", () => {
      const result = TemperatureConverter.convert({
        temperature: 100,
        unit: "celsius",
      });
      expect(result.celsius).toBe(100);
    });

    it("should return the same value for Fahrenheit if already in Fahrenheit", () => {
      const result = TemperatureConverter.convert({
        temperature: 212,
        unit: "fahrenheit",
      });
      expect(result.fahrenheit).toBe(212);
    });

    it("should return temperature in both units", () => {
      const result = TemperatureConverter.convert({
        temperature: 100,
        unit: "celsius",
      });

      expect(result).toHaveProperty("celsius");
      expect(result).toHaveProperty("fahrenheit");
    });

    it("should return correct values for both temperature units", () => {
      const result = TemperatureConverter.convert({
        temperature: 20.55,
        unit: "celsius",
      });

      expect(result.celsius).toBe(20.55);
      expect(result.fahrenheit).toBe(68.99);
    });
  });
});
