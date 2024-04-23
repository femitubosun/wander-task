import { Logger } from "@/Common/Utils/Logger";
import { Express } from "./Express";
import { appConfig } from "@/Config";
import { Job } from "bullmq";
import { QueueClient } from "@/Infra/Internal/Queue/Client";

export class Application {
  constructor(private express: Express) {
    const PORT = appConfig.PORT;

    this.#setupQueueWorker();

    this.express.app.listen(PORT, () => {
      Logger.info(`Server Launched on Port ${PORT} 🚀`);
    });
  }

  #setupQueueWorker() {
    const worker = QueueClient.failedSearch.createWorker();

    worker.on("completed", (job: Job) => {
      Logger.info(`Completed job with id ${job.id}`);
    });

    worker.on("active", (job: Job<unknown>) => {
      Logger.info(`Running job with id ${job.id}`);
    });
    worker.on("error", (failedReason: Error) => {
      Logger.error(`Job encountered an error`, failedReason);
    });

    Logger.info(`Queue Initialized 🚀`);
  }
}
