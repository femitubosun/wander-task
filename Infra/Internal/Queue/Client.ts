import { failedSearchQueue, queueConfig } from "@/Infra/Internal/Queue/Config";

export class QueueClient {
  constructor() {}

  static failedSearch = {
    addToQueue: async (location: string, date: string) => {
      return failedSearchQueue.add("job", { location, date }, queueConfig);
    },
  };
}
