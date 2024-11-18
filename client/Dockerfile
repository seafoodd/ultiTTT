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

COPY nginx.conf /etc/nginx/conf.d/default.conf

#COPY nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt
#COPY nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key

EXPOSE 80
#EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]