#!/usr/bin/env bash
# Scripts/setup-db.sh

npx prisma generate
npx prisma migrate dev

npm run start

exec "$@"