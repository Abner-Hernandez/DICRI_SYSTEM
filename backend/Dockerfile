FROM node:18-alpine

WORKDIR /app
COPY package*.json ./

RUN npm ci --only=production

COPY . .
RUN mkdir -p uploads
EXPOSE $API_PORT

USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
CMD node -e "require('http').get('http://localhost:$API_PORT/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["npm", "run", "dev"]