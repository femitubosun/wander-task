-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeatherCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cacheKey" TEXT NOT NULL,
    "weatherData" TEXT NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WeatherCache" ("cacheKey", "createdAt", "id", "weatherData") SELECT "cacheKey", "createdAt", "id", "weatherData" FROM "WeatherCache";
DROP TABLE "WeatherCache";
ALTER TABLE "new_WeatherCache" RENAME TO "WeatherCache";
CREATE INDEX "WeatherCache_cacheKey_isExpired_idx" ON "WeatherCache"("cacheKey", "isExpired");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
