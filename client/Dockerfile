FROM node:19.5.0-alpine AS build

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.19.5-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80