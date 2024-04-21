import ApplicationError from "@/Common/Exceptions/ApplicationError";
import { HttpStatusCodeEnum } from "@/Common/Utils";

export class NotFoundError extends ApplicationError {
  constructor(description = "Not found Error") {
    super({
      description,
      httpStatusCode: HttpStatusCodeEnum.NOT_FOUND,
      isOperational: undefined,
    });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
