import { Logger } from "@/Common/Utils/Logger";
import { Express } from "./Express";
import { appConfig } from "@/Config";

export class Application {
  constructor(private express: Express) {
    const PORT = appConfig.PORT;

    this.express.app.listen(PORT, () => {
      Logger.info(`Server Launched on Port ${PORT} 🚀`);
    });
  }
}
