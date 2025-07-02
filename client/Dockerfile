FROM node:22.14-alpine

# I used these instead of env_file long time ago, idk if they are still needed when building the client inside docker
#ARG VITE_API_URL
#ENV VITE_API_URL=$VITE_API_URL

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173