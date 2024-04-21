import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Logger } from "@/Common/Utils/Logger";
import path from "path";

class Database {
  public cursor?: ReturnType<typeof open> extends Promise<infer T> ? T : never;

  constructor() {
    Logger.info("Database Initialized");
  }

  async openDb() {
    const BASE_PATH = path.resolve(__dirname);
    const MIGRATIONS_PATH = path.join(BASE_PATH, "Database", "Migrations");

    this.cursor = await open({
      filename: "./database.db",
      driver: sqlite3.cached.Database,
    });

    Logger.info(`Database Initialized`);

    await this.cursor.migrate({
      migrationsPath: MIGRATIONS_PATH,
    });

    Logger.info(`Database Migrations Completed`);
  }
}

export default new Database();
