import { BaseUtilityArtifact } from "@/Common/Utils/BaseUtilityArtifact";

type ConvertTempDto = {
  temperature: number;
  unit: "fahrenheit" | "celsius";
};

type ConvertTempReturnType = {
  celsius: number;
  fahrenheit: number;
};

export class TemperatureConverter extends BaseUtilityArtifact {
  public static convert(convertTempDto: ConvertTempDto): ConvertTempReturnType {
    const { unit, temperature } = convertTempDto;

    return {
      celsius:
        unit == "celsius"
          ? temperature
          : this.convertFahrenheitToCelsius(temperature),
      fahrenheit:
        unit == "fahrenheit"
          ? temperature
          : this.convertCelsiusToFahrenheit(temperature),
    };
  }

  private static convertCelsiusToFahrenheit(temperature: number): number {
    return 1;
  }

  private static convertFahrenheitToCelsius(temperature: number): number {
    return 1;
  }
}
