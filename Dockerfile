FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV WEATHER_API_URL="https://staging.v4.api.wander.com/hiring-test/weather"
ENV NODE_ENV="production"
ENV CACHE_DB_URL="file:./app.cache"

COPY . .

EXPOSE 3000

RUN npm run prebuild

RUN npx tspc

RUN npx prisma generate

RUN npx prisma migrate dev

CMD ["npm", "start"]