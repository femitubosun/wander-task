import { Router } from "express";
import WeatherSearchRequestValidator from "@/Api/Validators/WeatherSearchRequestValidator";
import validate from "@/Common/Utils/validate";
import WeatherSearchController from "./Controllers/WeatherSearchController";
import { asyncMiddlewareHandler } from "@/Helpers/AyncMiddlewareHandler";
import { cacheMiddleware } from "@/Api/Middleware/cacheMiddleware";

const router = Router();

router.post(
  "/Search",
  WeatherSearchRequestValidator,
  validate,
  asyncMiddlewareHandler(cacheMiddleware),
  WeatherSearchController.handle,
);

export default router;
