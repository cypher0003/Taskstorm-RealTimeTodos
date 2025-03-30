import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { redisPublisher } from "./redis.mjs";

const filePath = 'backend/database/database.db';

//Tabellen mit `updated_at` für bessere Synchronisation
const createUserTableStatement = `
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      profile_picture TEXT DEFAULT NULL,
      creation_date DATE DEFAULT CURRENT_DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

const createFriendshipTableStatement = `
CREATE TABLE IF NOT EXISTS Friendships (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES Users (id),
  FOREIGN KEY (receiver_id) REFERENCES Users (id)
);
`;

const createTodoTable = `
  CREATE TABLE IF NOT EXISTS Todo (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      todo TEXT NOT NULL,
      status TEXT NOT NULL, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES Workspaces(id),
      FOREIGN KEY (creator_id) REFERENCES Users(id)
  );
`;

const createWorkspaceTableStatement = `
    CREATE TABLE IF NOT EXISTS Workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      creation_date DATE DEFAULT CURRENT_DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES Users(id)
    );
  `;

const createWorkspaceUsersTableStatement = `
  CREATE TABLE IF NOT EXISTS WorkspaceUsers (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
  );
`;

async function syncDatabaseToRedis(db) {
  const workspaces = db.prepare("SELECT * FROM Workspaces").all();
  
  for (const workspace of workspaces) {
      const todos = db.prepare("SELECT * FROM Todo WHERE workspace_id = ?").all(workspace.id);
      const members = db.prepare(`
          SELECT u.id, u.username, u.profile_picture 
          FROM Users u 
          JOIN WorkspaceUsers wu ON u.id = wu.user_id 
          WHERE wu.workspace_id = ?
      `).all(workspace.id);

      await redisPublisher.del(`workspace:${workspace.id}:todos`);
      
     
      for (const todo of todos) {
          await redisPublisher.lpush(`workspace:${workspace.id}:todos`, JSON.stringify(todo));
      }

      await redisPublisher.expire(`workspace:${workspace.id}:todos`, 600); 
      
      
      await redisPublisher.set(`workspace:${workspace.id}:members`, JSON.stringify(members), "EX", 600);
  }
}

export function dbConnector(fastify, options, next) {
    const db = new Database(filePath);
    db.exec(createUserTableStatement);
    db.exec(createFriendshipTableStatement);
    db.exec(createTodoTable);
    db.exec(createWorkspaceTableStatement);
    db.exec(createWorkspaceUsersTableStatement);

    // Cache sofort nach dem Start synchronisieren
    syncDatabaseToRedis(db);

    fastify.decorate("db", db);

    fastify.addHook("onClose", (fastify, done) => {
        db.close();
        done();
    });

    next();
}

export default fp(dbConnector);
