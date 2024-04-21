import express, { NextFunction, Request, Response } from "express";
import Routes from "@/Api/Router";
import { Logger } from "@/Common/Utils/Logger";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";

export class Express {
  app: express.Express;

  constructor() {
    this.app = express();

    this.#bootstrapServer();
  }

  #bootstrapServer() {
    this.#attachInfraMiddleWare();
    this.#attachRouter();
  }

  #attachInfraMiddleWare() {
    this.app.use(bodyParser.urlencoded({ extended: false }));

    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(
      cors({
        origin: ["*"],
      }),
    );

    Logger.info("Infrastructure Middleware Attached");
  }

  #attachRouter() {
    this.app.use("", Routes);

    Logger.info("Routes Attached");
  }
}
