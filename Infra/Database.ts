import { PrismaClient } from "@prisma/client";

class Database {
  public cursor = new PrismaClient();

  constructor() {}

  public weatherCache = this.cursor.weatherCache;
}

const instance = new Database();

export default instance;
