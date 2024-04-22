import { Logger } from "@/Common/Utils/Logger";
import { Express } from "./Express";
import { appConfig } from "@/Config";
import Database from "@/Infra/Database";

export class Application {
  constructor(private express: Express) {
    const PORT = appConfig.PORT;

    // this.#spinUpDb();

    this.express.app.listen(PORT, () => {
      Logger.info(`Server Launched on Port ${PORT} 🚀`);
    });
  }

  async #spinUpDb() {
    const database = Database;
    // await database.openDb();
  }
}
