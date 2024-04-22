type ConvertTempDto = {
  temperature: number;
  unit: "fahrenheit" | "celsius";
};

type ConvertTempReturnType = {
  celsius: number;
  fahrenheit: number;
};

export class TemperatureConverter {
  public static convert(convertTempDto: ConvertTempDto): ConvertTempReturnType {
    const { unit, temperature } = convertTempDto;

    const cleanedTemperature = this.#roundNumber(temperature);

    return {
      celsius:
        unit == "celsius"
          ? cleanedTemperature
          : this.#convertFahrenheitToCelsius(cleanedTemperature),
      fahrenheit:
        unit == "fahrenheit"
          ? cleanedTemperature
          : this.#convertCelsiusToFahrenheit(cleanedTemperature),
    };
  }

  static #convertCelsiusToFahrenheit(temperature: number): number {
    return this.#roundNumber((temperature * 9) / 5 + 32);
  }

  static #convertFahrenheitToCelsius(temperature: number): number {
    return this.#roundNumber(((temperature - 32) * 5) / 9);
  }

  static #roundNumber(num: number): number {
    return num % 1 ? num : parseFloat(num.toFixed(1));
  }
}
