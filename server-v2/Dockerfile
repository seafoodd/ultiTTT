FROM node:22.14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN npm install -g prisma

COPY prisma/schema.prisma ./prisma/

RUN prisma generate

EXPOSE 5000