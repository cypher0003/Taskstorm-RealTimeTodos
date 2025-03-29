# frontend/Dockerfile
FROM node:20

# Optional für native Module wie better-sqlite3 (falls benötigt)
# RUN apt-get update && apt-get install -y build-essential

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Next.js Dev-Server: Port 3000 oder 4000, je nachdem
EXPOSE 4000
# oder EXPOSE 4000 – schau in dein package.json, was du definierst.

# Starte den Dev-Server (oder Production-Build)
CMD ["npm", "run", "dev"]
