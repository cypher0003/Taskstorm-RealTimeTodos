import { todoModel } from "../models/todoModel.mjs";


export function getChatKey(userA, userB) {
    return `taskSpace_${[userA, userB].sort().join('_')}`;
}

export async function isUserOnline(redis, userId) {
    const status = await redis.get(`user:${userId}:status`);
    return status === "online"; 
}

export async function sendToRedis(db, redis, sender_id, receiver_id, todo) {
    const chatKey = getChatKey(sender_id, receiver_id);
    const task = todoModel(sender_id, receiver_id, todo);

    console.log("initialized task: ", task)
    console.log(`💬 Todo wird gesendet an ${receiver_id}:`, task);

    
    db.prepare(
        `INSERT INTO Todo (id, sender_id, receiver_id, todo, todoStatus, timestamp) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(task.id, task.sender_id, task.receiver_id, task.todo,task.todoStatus ,task.timestamp);

  
    const online = await isUserOnline(redis, receiver_id);
    console.log(online)

    if (online === true) {
        redis.publish(`tasks:${chatKey}`, JSON.stringify(task));
        console.log(`Task sofort an ${receiver_id} gesendet.`);
    } else {
        await redis.rpush(`tasks:${chatKey}`, JSON.stringify(task));
        console.log(`Empfänger ${receiver_id} ist offline. Nachricht zwischengespeichert.`);
    }
}

export async function getMessages(db, userA, userB, limit = 10000) {
    const stmt = db.prepare(`
        SELECT id, sender_id, receiver_id, todo, todoStatus, timestamp
        FROM Todo
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp DESC
        LIMIT ?
    `);
    return stmt.all(userA, userB, userB, userA, limit);
}

export async function sendCachedTodos(redis, userId, wsConnection) {
    
    const chatKeys1 = await redis.keys(`tasks:taskSpace_${userId}_*`);
    
    const chatKeys2 = await redis.keys(`tasks:taskSpace_*_${userId}`);

    
    const allChatKeys = [...new Set([...chatKeys1, ...chatKeys2])];

    for (const chatKey of allChatKeys) {
        const tasks = await redis.lrange(chatKey, 0, -1);

        for (const tsk of tasks) {
            wsConnection.send(tsk);
            console.log(`📨 Ungelesene Nachricht an ${userId} gesendet:`, tsk);
        }

        
        await redis.del(chatKey);
    }
}

export function subscribeToMessages(redis, clients) {
    redis.on("pmessage", (pattern, channel, message) => {
        console.log(` Redis-Nachricht empfangen auf ${channel}:`, message);

        try {
            const parsedMessage = JSON.parse(message);
            const receiverId = parsedMessage.receiver_id;

            
            if (clients[receiverId]) {
                clients[receiverId].send(JSON.stringify(parsedMessage));
                console.log(`Nachricht an WebSocket-Client ${receiverId} gesendet.`);
            }
        } catch (error) {
            console.error("Fehler beim Parsen der Redis-Nachricht:", error.message);
        }
    });

    console.log("WebSocket-Server hört jetzt auf Redis-Pub/Sub Nachrichten.");
}
