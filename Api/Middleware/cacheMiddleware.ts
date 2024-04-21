import { NextFunction, Request, Response } from "express";
import { SqliteCacheDriver } from "@/Services/Caching/SqliteCacheDriver";
import { NULL_OBJECT, SUCCESS, TEMPERATURE_RETRIEVED } from "@/Common/Messages";
import { HttpStatusCodeEnum } from "@/Common/Utils";
import { Middleware } from "@/TypeChecking/Api/Middleware";

export const cacheMiddleware: Middleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { date, location } = request.body;

  const cacheDriver = new SqliteCacheDriver();

  const cacheKey = cacheDriver.keyFrom({
    location,
    date,
  });

  const cacheObject = await cacheDriver.get(cacheKey);

  if (cacheObject === NULL_OBJECT) {
    return next();
  }

  if (cacheObject.hasExpired()) {
    await cacheObject.delete();

    return next();
  }

  return response.status(HttpStatusCodeEnum.OK).json({
    statusCode: HttpStatusCodeEnum.OK,
    status: SUCCESS,
    message: TEMPERATURE_RETRIEVED,
    results: cacheObject.data,
  });
};
