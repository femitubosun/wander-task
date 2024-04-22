-- CreateTable
CREATE TABLE "WeatherCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cacheKey" TEXT NOT NULL,
    "weatherData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "WeatherCache_cacheKey_key" ON "WeatherCache"("cacheKey");
