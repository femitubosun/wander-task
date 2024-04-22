import { PrismaClient } from "@prisma/client";

class Database {
  public cursor = new PrismaClient();

  constructor() {}

  public weatherCache = this.cursor.weatherCache;
}

export default new Database();
