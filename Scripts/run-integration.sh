#!/usr/bin/env bash
# Scripts/run-integration.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
echo '🟡 - Waiting for database to be ready...'
$DIR/wait-for-it.sh "${CACHE_DB_URL}" -- echo '🟢 - Database is ready!'
npx prisma migrate dev
jest --coverage --testPathPattern='\.Integration\.Test\.ts$' --detectOpenHandles