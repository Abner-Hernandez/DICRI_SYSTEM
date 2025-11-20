FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE $FRONTEND_PORT

CMD ["npm", "start -- --reset-cache"]