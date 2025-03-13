import { todoModel } from "../models/todoModel.mjs";
import { workSpaceModel } from "../models/workSpaceModel.mjs";
import {  cacheWorkspaceTodos, getCachedWorkspaceTodos, cacheWorkspaceMembers, getCachedWorkspaceMembers} from "../database/redis.mjs";
import { workSpaceToUserModel } from "../models/workSpaceModel.mjs"
import { getUserByUsername } from "./userLogik.mjs";

export async function sendToRedis(db, redis, workspaceId, creator_id, todo) {
    const channel = `workspace:${workspaceId}`;
    const task = todoModel(workspaceId, creator_id, todo);

    console.log(`Neues To-Do für Workspace ${workspaceId}:`, task);

    db.prepare(`
        INSERT INTO Todo (id, workspace_id, creator_id, todo, status, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(task.id, task.workspace_id, task.creator_id, task.todo, task.todoStatus, task.timestamp);

    redis.publish(channel, JSON.stringify(task));
    console.log("✅ To-Do gesendet & gespeichert.");

    const members = await getAllMembersOfAWorkspace(db, workspaceId)
    for (const member of members)
    {
        await cacheWorkspaceTodos(workspaceId, member.id, task)
    }
}

export async function getTodosOfWorkspace(db, workspaceId, limit = 10000) {
    const cachedTodos = await getCachedWorkspaceTodos(workspaceId);
    if (cachedTodos.length > 0) {
        console.log(`Lade To-Dos aus Cache für Workspace ${workspaceId}`);
        return cachedTodos;
    }

    console.log(`🔍 Lade To-Dos aus der Datenbank für Workspace ${workspaceId}`);
    const todos = db.prepare(`
        SELECT id, workspace_id, creator_id, todo, status, timestamp
        FROM Todo
        WHERE workspace_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `).all(workspaceId, limit);

    await cacheWorkspaceTodos(workspaceId, todos);
    return todos;
}

export async function sendCachedTodos(redis, workspaceId, userId, wsConnection) {
    const cacheKey = `user:${userId}:workspace:${workspaceId}:todos`;
    const cachedTasks = await redis.lrange(cacheKey, 0, -1);

    cachedTasks.forEach(task => {
        wsConnection.send(task);
        console.log(`📤 Gesendete ungelesene Nachricht für User ${userId} in Workspace ${workspaceId}:`, task);
    });

    await redis.del(cacheKey);  // Nur diesen User-Cache löschen, nicht für andere Nutzer
}

export function subscribeToMessages(redis, workspaceClients) {
    redis.on("message", (channel, message) => {
        console.log(`Redis-Nachricht empfangen auf ${channel}:`, message);

        // Extrahiere Workspace-ID aus dem Channel-Namen
        const parts = channel.split(":");
        if (parts.length < 2) return;
        const workspaceId = parts[1];

        if (workspaceClients[workspaceId]) {
            workspaceClients[workspaceId].forEach(client => {
                client.send(message);
            });

            console.log(`Nachricht an alle Clients im Workspace ${workspaceId} gesendet.`);
        } else {
            console.log(`Keine aktiven Clients für Workspace ${workspaceId}. Speichere Nachricht im Cache.`);

            // Nachricht in Redis für später speicher (Offline-Nutzer)
            redis.rpush(`workspace:${workspaceId}:todos`, message);
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

        console.log("✅ Workspace erfolgreich in der DB gespeichert. ", newWorkspace);


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


        console.log(`✅ Benutzer ${user_id} erfolgreich zu Workspace ${workspace_id} hinzugefügt.`);

        // Cache aktualisieren
        const updatedMembers = db.prepare(`
            SELECT u.id, u.username, u.profile_picture 
            FROM Users u 
            JOIN WorkspaceUsers wu ON u.id = wu.user_id 
            WHERE wu.workspace_id = ?
        `).all(workspace_id);

        await cacheWorkspaceMembers(workspace_id, updatedMembers);

        return "✅ Benutzer ist jetzt Mitglied im Workspace.";
    } catch (err) {
        console.error(`❌ Fehler beim Hinzufügen von Benutzer ${user_id} zu Workspace ${workspace_id}:`, err.message);
        throw err;
    }
}

export async function getAllMembersOfAWorkspace(db, workspace_id) {
    console.log(`📌 Lade Mitglieder von Workspace ${workspace_id}`);
    const cachedMembers = await getCachedWorkspaceMembers(workspace_id);
    if (cachedMembers.length > 0) {
        console.log(`⚡ Mitglieder aus Cache geladen für Workspace ${workspace_id}`);
        return cachedMembers;
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

export async function findWorkspaceById(db, workspaceId) {
    console.log(`Lade Workspace ${workspaceId}`);

    const workspace = db.prepare(`
        SELECT * FROM Workspaces
        WHERE id = ?
    `).get(workspaceId);

    if (!workspace) throw new Error(`Workspace ${workspaceId} nicht gefunden.`);

    console.log(`✅ Workspace ${workspaceId} gefunden:`, workspace);
    return workspace;
}

export async function leaveWorkspace(db, username, workspaceID) {
    try{
        console.log("trying to remove link");
        const targetUser = await getUserByUsername(db, username);
        if(!targetUser) throw new Error("User not found");

        const targetSpace = await findWorkspaceById(db, workspaceID);
        if(!targetSpace) throw new Error("Workspace not found");

        db.prepare(` DELETE FROM WorkspaceUsers WHERE user_id = ? AND workspace_id = ?`).run(targetUser.id, targetSpace.id);
        return "User removed from workspace";
    }catch(err){
        console.error(`Fehler beim Verlassen des Workspaces ${workspaceID}:`, err.message);
        throw err;
    }
}
