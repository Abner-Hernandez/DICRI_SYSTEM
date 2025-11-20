FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE $FRONTEND_PORT

CMD ["npm", "start"]