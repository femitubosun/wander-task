import { failedSearchQueue, queueConfig } from "@/Infra/Internal/Queue/Config";
import { Worker } from "bullmq";
import { appConfig } from "@/Config";
import RetryFailedSearch from "@/Infra/Internal/Queue/Jobs/RetryFailedSearch";

export class QueueClient {
  static failedSearch = {
    addToQueue: async (location: string, date: string) => {
      return failedSearchQueue.add("job", { location, date }, queueConfig);
    },
    createWorker: () =>
      new Worker(appConfig.QUEUE.FAILED_SEARCH_QUEUE_NAME, RetryFailedSearch, {
        connection: {
          host: appConfig.QUEUE.REDIS_QUEUE_HOST,
          port: appConfig.QUEUE.REDIS_QUEUE_PORT,
        },
        autorun: true,
        runRetryDelay: appConfig.QUEUE.FAILED_JOB_RETRY_DELAY,
      }),
  };
}
