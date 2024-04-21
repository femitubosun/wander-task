import ApplicationError from "@/Common/Exceptions/ApplicationError";
import { HttpStatusCodeEnum } from "@/Common/Utils";

export class BadRequestError extends ApplicationError {
  constructor(description = "Bad Request Error") {
    super({
      description,
      httpStatusCode: HttpStatusCodeEnum.BAD_REQUEST,
      isOperational: undefined,
    });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
