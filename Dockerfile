
FROM node:16


WORKDIR /app


COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/


RUN cd frontend && npm install
RUN cd backend && npm install


COPY frontend ./frontend
COPY backend ./backend

RUN cd frontend && npm run build


RUN mkdir -p /app/backend/public
RUN mv /app/frontend/build/* /app/backend/public/

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "src/app.js"]