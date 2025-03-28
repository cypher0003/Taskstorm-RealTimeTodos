# Wechsle von node:16 auf node:20 (oder node:20-slim)
FROM node:20

# Für native Addons wie better-sqlite3 brauchst du einen Compiler:
RUN apt-get update && apt-get install -y build-essential
RUN apt-get update && apt-get install -y sqlite3


WORKDIR /app

# Kopiere package.json / package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Restlichen Code kopieren (server.mjs, etc.)
COPY . .

# Offenlegung Port 3000
EXPOSE 3000

CMD ["node", "server.mjs"]
