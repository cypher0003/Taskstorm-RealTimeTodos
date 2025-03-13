import { todoModel } from "../models/todoModel.mjs";
import { workSpaceModel } from "../models/workSpaceModel.mjs";

import {  cacheWorkspaceTodos, getCachedWorkspaceTodos, cacheWorkspaceMembers, getCachedWorkspaceMembers} from "../database/redis.mjs";
import { workSpaceToUserModel } from "../models/workSpaceModel.mjs"

export function getWorkspaceChannel(workspaceId) {
    return `workspace:${workspaceId}`;
}
  
export async function isUserOnline(redis, userId) {
    const status = await redis.get(`user:${userId}:status`);
    return status === "online"; 
}

export async function sendToRedis(db, redis, workspaceId, creator_id, todo) {
    const channel = getWorkspaceChannel(workspaceId);
    const task = todoModel(workspaceId, creator_id, todo);

    console.log("initialized task: ", task)
    console.log("task wil be send to corresponding workspace: ", channel);

    
    db.prepare(
        `INSERT INTO Todo (id, workspace_id, creator_id, todo, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(task.id, task.workspace_id, task.creator_id, task.todo,task.todoStatus ,task.timestamp);

   redis.publish(channel, JSON.stringify(task));
   console.log("task is now visible in the corresponding workspace")
}

export async function getTodosOfWorkspace(db, workspace_id, limit = 10000) {
    const stmt = db.prepare(`
         SELECT id, workspace_id, creator_id, todo, status, timestamp
        FROM Todo
        WHERE workspace_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `);
    return stmt.all(workspace_id, limit);
}

export async function sendCachedTodos(redis, workspaceId, wsConnection) {
    const cacheKey = `workspace:${workspaceId}:cache`;
    const tasks = await redis.lrange(cacheKey, 0, -1);
  
    for (const task of tasks) {
      wsConnection.send(task);
      console.log(`Ungelesene Nachricht an Workspace ${workspaceId} gesendet:`, task);
    }
  
    await redis.del(cacheKey);
  }

export function subscribeToMessages(redis, workspaceClients) {
    redis.on("message", (channel, message) => {
      console.log(`Redis-Nachricht empfangen auf ${channel}:`, message);

      const parts = channel.split(":");
      if (parts.length < 2) return;
      const workspaceId = parts[1];
      if (workspaceClients[workspaceId]) {
        workspaceClients[workspaceId].forEach(client => {
          client.send(message);
        });
        console.log(`Nachricht an alle Clients in Workspace ${workspaceId} gesendet.`);
      }
    });
    console.log("WebSocket-Server hört jetzt auf Redis-Pub/Sub Nachrichten.");
}

export async function createWorkspace(db, name, admin_id) {

        const newWorkspace = workSpaceModel(name, admin_id);
        if (!newWorkspace) throw new Error("Workspace konnte nicht erstellt werden.");

       
        db.prepare(`
            INSERT INTO Workspaces(id, name, admin_id) 
            VALUES(?, ?, ?)
        `).run(newWorkspace.id, newWorkspace.name, newWorkspace.admin_id);

        console.log("workspace model created: ", newWorkspace)


        const model = workSpaceToUserModel(newWorkspace.id, newWorkspace.admin_id);
        console.log("Workspace-Admin erfolgreich hinzugefügt. ", model);
        db.prepare(`
            INSERT INTO WorkspaceUsers(id, workspace_id, user_id) 
            VALUES(?, ?, ?)
        `).run(model.id, model.workspace_id, model.user_id);

      
        await cacheWorkspaceMembers(newWorkspace.id, [{ id: admin_id, username: "Admin" }]);

        console.log("insertion done")

        return newWorkspace
        }
    
    
       
    




export async function addFriendToWorkspace(db, id, workspace_id, user_id) {
    try {
        db.prepare(`
            INSERT INTO WorkspaceUsers(id, workspace_id, user_id) 
            VALUES(?, ?, ?)
        `).run(id, workspace_id, user_id);


        return 'user is now workspace member'
    }catch(err)
    {
        console.log(err.message)
        throw err

        
    }
    
}

export async function getAllMembersOfAWorkspace(db, workspace_id) {

    console.log("fetching all members...")
    
    try{
        const allMembers = db.prepare('SELECT u.username, u.profile_picture FROM Users u JOIN WorkspaceUsers wu ON u.id = wu.user_id WHERE wu.workspace_id = ?').all(workspace_id)
        if(!allMembers || allMembers.length === 0)
        {
            console.log("error while fetching")
            throw new Error("error while fetching")
        }

        console.log("fetched all members")
        return allMembers
    }catch(err) 
    {
        console.log(err.message)
        throw err
    }


}

export async function updateTodo(db, redis, todoId, newText = null, newStatus = null) {
    console.log(`🔄 Aktualisiere To-Do: ${todoId}`);

    // Nur das ändern, was übergeben wurde
    const updateQuery = db.prepare(`
        UPDATE Todo 
        SET todo = COALESCE(?, todo),
            status = COALESCE(?, status)
        WHERE id = ?
    `);
    updateQuery.run(newText, newStatus, todoId);

    // Aktualisierte To-Do aus der Datenbank abrufen
    const updatedTodo = db.prepare(`SELECT * FROM Todo WHERE id = ?`).get(todoId);
    
    // Redis-Cache aktualisieren
    const cacheKey = `workspace:${updatedTodo.workspace_id}:todos`;
    await redis.lrem(cacheKey, 0, JSON.stringify(updatedTodo)); // Altes löschen
    await redis.lpush(cacheKey, JSON.stringify(updatedTodo)); // Neues speichern

    // WebSocket-Broadcast für alle Clients im Workspace
    const channel = `workspace:${updatedTodo.workspace_id}`;
    redis.publish(channel, JSON.stringify({ action: "update", todo: updatedTodo }));

    return updatedTodo;
}

export async function deleteTodo(db, redis, todoId) {
    console.log(`Lösche To-Do: ${todoId}`);

    const todo = db.prepare("SELECT * FROM Todo WHERE id = ?").get(todoId);
    if (!todo) throw new Error("To-Do nicht gefunden!");


    db.prepare("DELETE FROM Todo WHERE id = ?").run(todoId);

    const cacheKey = `workspace:${todo.workspace_id}:todos`;
    await redis.lrem(cacheKey, 0, JSON.stringify(todo)); 

    const channel = `workspace:${todo.workspace_id}`;
    redis.publish(channel, JSON.stringify({ action: "delete", todoId }));

    console.log(`To-Do ${todoId} erfolgreich gelöscht.`);
}

export async function findAllWorkspacesForAUser(db, userId) {
    try {
        console.log(`🔍 Lade Workspaces für User ${userId}`);

        const result = db.prepare(`
            SELECT DISTINCT w.id, w.name, w.admin_id, w.creation_date
            FROM Workspaces w
            LEFT JOIN WorkspaceUsers wu ON w.id = wu.workspace_id
            WHERE wu.user_id = ? OR w.admin_id = ?
        `).all(userId, userId);  // userId wird für beide Bedingungen verwendet!

        console.log(`✅ Gefundene Workspaces für User ${userId}:`, result);
        return result;

    } catch (err) {
        console.error(`❌ Fehler beim Laden der Workspaces für User ${userId}:`, err.message);
        throw err;
    }
}

