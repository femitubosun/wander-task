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

    return {
      celsius:
        unit == "celsius"
          ? temperature
          : this.#convertFahrenheitToCelsius(temperature),
      fahrenheit:
        unit == "fahrenheit"
          ? temperature
          : this.#convertCelsiusToFahrenheit(temperature),
    };
  }

  static #convertCelsiusToFahrenheit(temperature: number): number {
    return this.#roundNumber((temperature * 9) / 5 + 32);
  }

  static #convertFahrenheitToCelsius(temperature: number): number {
    return this.#roundNumber(((temperature - 32) * 5) / 9);
  }

  static #roundNumber(num: number): number {
    return Math.round(num * 10) / 10;
  }
}
