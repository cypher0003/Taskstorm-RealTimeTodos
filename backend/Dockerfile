
FROM node:20

RUN apt-get update && apt-get install -y build-essential
RUN apt-get update && apt-get install -y sqlite3


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3000

CMD ["node", "server.mjs"]
