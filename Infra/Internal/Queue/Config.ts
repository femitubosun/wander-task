import { Queue, Job, JobsOptions } from "bullmq";
import { appConfig } from "@/Config";

export const queueConfig: JobsOptions = {
  removeOnComplete: {
    age: 3600,
  },
  removeOnFail: {
    age: 24 * 3600,
  },
  attempts: appConfig.QUEUE.FAILED_JOB_RETRIES,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};

export const failedSearchQueue = new Queue(
  appConfig.QUEUE.FAILED_SEARCH_QUEUE_NAME,
  {
    connection: {
      host: appConfig.QUEUE.REDIS_QUEUE_HOST,
      port: appConfig.QUEUE.REDIS_QUEUE_PORT,
    },
  },
);
