#!/usr/bin/env bash

export $(grep -v '^#' .env | xargs)
export CACHE_DB_URL='file:./test.app.cache'
export NODE_ENV='test'