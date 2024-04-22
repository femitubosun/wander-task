import SqliteDb from "better-sqlite3";
import { Logger } from "@/Common/Utils/Logger";
import path from "path";
import { appConfig } from "@/Config";
import { PrismaClient } from "@prisma/client";

class Database {
  public cursor = new PrismaClient();

  constructor() {
    Logger.info("Database Initialized");
  }

  public weatherCache = this.cursor.weatherCache;

  // async openDb() {
  //   const BASE_PATH = path.resolve(__dirname);
  //   const MIGRATIONS_PATH = path.join(BASE_PATH, "Database", "Migrations");
  //   const CACHE_DB_NAME = appConfig.CACHE.CACHE_DB_NAME;
  //
  //   this.cursor = new SqliteDb(CACHE_DB_NAME);
  //   this.cursor.pragma("journal_mode = WAL");
  //
  //   //   migrationsPath: MIGRATIONS_PATH,
  //   const cacheQuery = `CREATE TABLE IF NOT EXISTS weather_cache
  //                           (
  //                               cache_key
  //                               TEXT
  //                               PRIMARY
  //                               KEY
  //                               UNIQUE,
  //                               weather_data
  //                               TEXT,
  //                               created_at
  //                               TIMESTAMP
  //                               DEFAULT
  //                               CURRENT_TIMESTAMP
  //                           );
  //       `;
  //
  //   this.cursor.prepare(cacheQuery).run();
  //
  //   Logger.info(`Database Launched 🚀`);
  //
  //   // await this.cursor.migrate({
  //   //   migrationsPath: MIGRATIONS_PATH,
  //   // });
  //
  //   Logger.info(`Database Migrated 🕊️`);
  // }
}

export default new Database();
