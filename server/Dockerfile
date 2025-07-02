FROM node:22.14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma

RUN prisma generate

COPY prisma/schema.prisma ./prisma/

EXPOSE 5000

CMD [ "npm", "start" ]