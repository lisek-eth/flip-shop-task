FROM node:14-alpine

WORKDIR /usr/src/ep-service
COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
