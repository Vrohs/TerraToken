FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
COPY backend/.env /app/backend/.env
CMD ["npm", "start"]