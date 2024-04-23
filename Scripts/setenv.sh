#!/usr/bin/env bash
# Scripts/setenv.sh

export $(grep -v '^#' .env | xargs)
export CACHE_DB_URL='file:./test.app.cache'
export NODE_ENV='test'