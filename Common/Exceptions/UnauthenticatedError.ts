import ApplicationError from "@/Common/Exceptions/ApplicationError";
import { HttpStatusCodeEnum } from "@/Common/Utils";

export class UnauthenticatedError extends ApplicationError {
  constructor(description = "Not Authenticated") {
    super({
      description,
      httpStatusCode: HttpStatusCodeEnum.UNAUTHENTICATED,
      isOperational: undefined,
    });

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
