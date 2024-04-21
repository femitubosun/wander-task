import { NextFunction, Request, Response } from "express";
import { SqliteCachingDriver } from "@/Services/Caching/SqliteCachingDriver";
import { NULL_OBJECT, SUCCESS, TEMPERATURE_RETRIEVED } from "@/Common/Messages";
import { HttpStatusCodeEnum } from "@/Common/Utils";
import * as console from "node:console";

export const cacheMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { date, location } = request.body;

  const cacheDriver = new SqliteCachingDriver();

  const cacheKey = cacheDriver.keyFrom({
    location,
    date,
  });

  const cacheObject = await cacheDriver.get(cacheKey);

  if (cacheObject === NULL_OBJECT) {
    return next();
  }

  if (cacheObject.hasExpired()) {
    await cacheObject.remove();

    return next();
  }

  return response.status(HttpStatusCodeEnum.OK).json({
    statusCode: HttpStatusCodeEnum.OK,
    status: SUCCESS,
    message: TEMPERATURE_RETRIEVED,
    results: cacheObject.data,
  });
};
