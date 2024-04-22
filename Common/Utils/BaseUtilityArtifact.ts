import { Logger } from "./Logger";

export class BaseUtilityArtifact {
  protected LogError(error: any) {
    Logger.error(`${this.constructor.name} Error: ${error}`);
  }
}
