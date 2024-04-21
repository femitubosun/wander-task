--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_cache (
    cache_key TEXT PRIMARY KEY UNIQUE,
    weather_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS weather_cache;