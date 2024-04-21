import { Logger } from "@/Common/Utils/Logger";
import { Express } from "./Express";
import { appConfig } from "@/Config";
import Database from "@/Infra/Database";

export class Application {
  constructor(private express: Express) {
    const PORT = appConfig.PORT;

    this.#setupDb();

    this.express.app.listen(PORT, () => {
      Logger.info(`Server Started on Port ${PORT}`);
    });
  }

  async #setupDb() {
    const database = Database;
    await database.openDb();
    // Database;
  }
}
