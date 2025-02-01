import { redisPublisher } from "../database/redis.mjs";
import { messageModel } from "../models/messageModel.mjs";

export function getChatKey(userA, userB) {
    return `chat_${[userA, userB].sort().join('_')}`;
}

export async function sendToRedis(sender_id, receiver_id, text) {
    const chatKey = getChatKey(sender_id, receiver_id);
    const message = messageModel(sender_id,receiver_id,text);
    console.log("chat-channel is: ", `messages:${chatKey}`)
    await redisPublisher.rpush(`messages:${chatKey}`, JSON.stringify(message)); 

    redisPublisher.publish(`messages:${chatKey}`, JSON.stringify(message)); 
}

export async function getMessages(redis, userA, userB, limit = 50) {
    const chatKey = getChatKey(userA, userB);
    const messages = await redisPublisher.lrange(chatKey, -limit, -1);
    return messages.map(msg => JSON.parse(msg)); // ✅ Wandelt gespeicherte JSON-Nachrichten korrekt um
}

// ✅ Verbesserte Subscribe-Funktion
export function subscribeToMessages(redis, clients) {
    redis.on("pmessage", (pattern, channel, message) => {
        console.log(`📢 Redis-Nachricht empfangen auf ${channel}:`, message);
        
        try {
            const parsedMessage = JSON.parse(message);
            const receiverId = parsedMessage.receiver_id;

            // ✅ Falls der Empfänger verbunden ist, Nachricht senden
            if (clients[receiverId]) {
                clients[receiverId].send(JSON.stringify(parsedMessage));
                console.log(`📨 Nachricht an WebSocket-Client ${receiverId} gesendet.`);
            }
        } catch (error) {
            console.error("❌ Fehler beim Parsen der Redis-Nachricht:", error.message);
        }
    });

    console.log("✅ WebSocket-Server hört jetzt auf Redis-Pub/Sub Nachrichten.");
}

