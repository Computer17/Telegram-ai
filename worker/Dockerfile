FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

ENV NODE_ENV=production
ENV RUN_STANDALONE_WORKER=true

CMD ["npm", "run", "dev"]
