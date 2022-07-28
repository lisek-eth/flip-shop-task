FROM node:14-alpine

WORKDIR /usr/src/cron-service
COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]
