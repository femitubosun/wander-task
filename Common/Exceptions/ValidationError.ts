import ApplicationError from "@/Common/Exceptions/ApplicationError";
import { HttpStatusCodeEnum } from "@/Common/Utils";

export class ValidationError extends ApplicationError {
  constructor(description = "Validation Error") {
    super({
      description,
      httpStatusCode: HttpStatusCodeEnum.UNPROCESSABLE_ENTITY,
      isOperational: undefined,
    });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
