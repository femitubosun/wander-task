import { Logger } from "./Logger";

export class BaseUtilityArtifact {
    protected static LogError(error: any){
        Logger.error(`${this.constructor.name} Error: ${error}`)
      }
}