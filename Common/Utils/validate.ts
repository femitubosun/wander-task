import { ERROR, VALIDATION_ERROR } from "@/Common/Messages";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HttpStatusCodeEnum } from "@/Common/Utils";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  return res.status(HttpStatusCodeEnum.UNPROCESSABLE_ENTITY).json({
    statusCode: HttpStatusCodeEnum.UNPROCESSABLE_ENTITY,
    message: VALIDATION_ERROR,
    status: ERROR,
    errors: errors.array(),
  });
};

export default validate;
