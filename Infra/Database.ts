import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Logger } from "@/Common/Utils/Logger";
import path from "path";
import { appConfig } from "@/Config";

class Database {
  public cursor?: ReturnType<typeof open> extends Promise<infer T> ? T : never;

  constructor() {
    Logger.info("Database Initialized");
  }

  async openDb() {
    const BASE_PATH = path.resolve(__dirname);
    const MIGRATIONS_PATH = path.join(BASE_PATH, "Database", "Migrations");
    const CACHE_DB_NAME = appConfig.CACHE.CACHE_DB_NAME;

    this.cursor = await open({
      filename: `./${CACHE_DB_NAME}`,
      driver: sqlite3.cached.Database,
    });

    Logger.info(`Database Launched 🚀`);

    await this.cursor.migrate({
      migrationsPath: MIGRATIONS_PATH,
    });

    Logger.info(`Database Migrated 🕊️`);
  }
}

export default new Database();
