import fp from "fastify-plugin";
import Database from "better-sqlite3";
const filePath = 'database/database.db';

const createUserTableStatement = `
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      creation_date DATE DEFAULT CURRENT_DATE
    )`;

const createFriendshipTableStatement = `
CREATE TABLE IF NOT EXISTS Friendships (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES Users (id),
  FOREIGN KEY (receiver_id) REFERENCES Users (id)
);
`

export function dbConnector(fastify, options, next) {
    const db = new Database(filePath);
    db.exec(createUserTableStatement);
    db.exec(createFriendshipTableStatement)

  
    fastify.decorate("db", db);
  
    fastify.addHook("onClose", (fastify, done) => {
      db.close();
      done();
    });
  
    next();
  }

  export default fp(dbConnector)