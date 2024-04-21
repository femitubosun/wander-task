import { Response, NextFunction } from "express";
import ApplicationError from "./ApplicationError";
import {
  CRITICAL_ERROR_EXITING,
  ERROR,
} from "@/Common/Messages";
import { HttpStatusCodeEnum } from "@/Common/Utils";
import { Logger } from "@/Common/Utils/Logger";
import { BaseUtilityArtifact } from "../Utils/BaseUtilityArtifact";

class ErrorHandler {
  private isTrustedError(error: Error): boolean {
    if (error instanceof ApplicationError) {
      return error.isOperational;
    }

    return false;
  }

  public handleError(
    error: Error | ApplicationError,
    response?: Response
  ): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as ApplicationError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }

  private handleTrustedError(
    error: ApplicationError,
    response: Response
  ): void {
    response.status(error.httpCode).json({
      status_code: error.httpCode,
      status: ERROR,
      message: error.message,
    });
  }

  private handleCriticalError(
    error: Error | ApplicationError,
    response?: Response
  ): void {
    if (response) {
      response.status(HttpStatusCodeEnum.INTERNAL_SERVER_ERROR).json({
        status_code: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        status: ERROR,
        message: error.message,
      });
    }
    Logger.error(error);
    Logger.error(CRITICAL_ERROR_EXITING);
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();
