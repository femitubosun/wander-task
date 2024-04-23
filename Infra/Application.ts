import { Logger } from "@/Common/Utils/Logger";
import { Express } from "./Express";
import { appConfig } from "@/Config";
import { Job, Worker } from "bullmq";
import RetryFailedSearch from "@/Jobs/RetryFailedSearch";

export class Application {
  constructor(private express: Express) {
    const PORT = appConfig.PORT;

    this.#setupQueueWorker();

    this.express.app.listen(PORT, () => {
      Logger.info(`Server Launched on Port ${PORT} 🚀`);
    });
  }

  #setupQueueWorker() {
    const worker = new Worker(
      appConfig.QUEUE.FAILED_SEARCH_QUEUE_NAME,
      RetryFailedSearch,
      {
        connection: {
          host: appConfig.QUEUE.REDIS_QUEUE_HOST,
          port: appConfig.QUEUE.REDIS_QUEUE_PORT,
        },
        autorun: true,
        runRetryDelay: appConfig.QUEUE.FAILED_JOB_RETRY_DELAY,
      },
    );

    worker.on("completed", (job: Job) => {
      Logger.info(`Completed job with id ${job.id}`);
    });

    worker.on("active", (job: Job<unknown>) => {
      Logger.info(`Completed job with id ${job.id}`);
    });
    worker.on("error", (failedReason: Error) => {
      Logger.error(`Job encountered an error`, failedReason);
    });
  }
}
