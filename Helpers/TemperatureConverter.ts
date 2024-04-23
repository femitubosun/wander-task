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

    const roundedTemp = this.#roundNumber(temperature);

    return {
      celsius:
        unit == "celsius"
          ? roundedTemp
          : this.#convertFahrenheitToCelsius(roundedTemp),
      fahrenheit:
        unit == "fahrenheit"
          ? roundedTemp
          : this.#convertCelsiusToFahrenheit(roundedTemp),
    };
  }

  static #convertCelsiusToFahrenheit(temperature: number): number {
    return this.#roundNumber((temperature * 9) / 5 + 32);
  }

  static #convertFahrenheitToCelsius(temperature: number): number {
    return this.#roundNumber(((temperature - 32) * 5) / 9);
  }

  static #roundNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
