FROM node:22.14-alpine

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173