FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# --------------------- GENERAL DEFAULTS --------------------
ENV WEATHER_API_URL="https://staging.v4.api.wander.com/hiring-test/weather"
ENV NODE_ENV="production"
ENV CACHE_DB_URL="file:./app.cache"

EXPOSE 3000

RUN npm run prebuild

RUN npm run build

RUN npm run prisma:migrate

CMD ["npm", "start"]