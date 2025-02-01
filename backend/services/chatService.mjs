import { sendToRedis, getMessages, getChatKey } from "../logik/chatLogik.mjs";
import { sendMessageOptions, getMessagesOptions } from "../schemas/chatSchema.mjs";

const clients = {}; 

export async function chatService(fastify, options) {
    
    fastify.post("/send", sendMessageOptions, async (request, reply) => {
        try {
            const currentUser = request.user;
            const sender_id = currentUser.id;
            const { receiver_id, message } = request.body;

            if (!sender_id || !receiver_id || !message) {
                return reply.status(400).send({ error: "Fehlende Parameter" });
            }

            await sendToRedis(sender_id, receiver_id, message); 
            return reply.status(201).send({ message: "Gesendet!" });

        } catch (error) {
            console.error("❌ Fehler beim Senden der Nachricht:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });

   fastify.get('/ws/messages/:userId', { websocket: true }, (connection, req) => {
    const { userId } = req.params;
    if (!userId) {
        console.log("❌ Fehler: Keine User-ID übergeben!");
        connection.close();
        return;
    }

    console.log("WebSocket verbunden für User:", userId);
    const redisSubscriber = fastify.redis.redisSubscriber;
    clients[userId] = connection;

    const chatKeyPattern1 = `messages:chat_${userId}_*`; 
    const chatKeyPattern2 = `messages:chat_*_${userId}`;  

    redisSubscriber.psubscribe(chatKeyPattern1, (err, count) => {
        if (err) {
            console.error(`❌ Fehler beim Abonnieren des Redis-Channels für User ${userId}:`, err);
            connection.close();
            return;
        }
        console.log(`✅ WebSocket-Client ${userId} hört auf ${count} Channels.`);
    });

    redisSubscriber.psubscribe(chatKeyPattern2, (err, count) => {
        if (err) {
            console.error(`❌ Fehler beim Abonnieren des Redis-Channels für User ${userId}:`, err);
            connection.close();
            return;
        }
        console.log(`✅ WebSocket-Client ${userId} hört auf ${count} Channels.`);
    });

    // Nachrichten vom Redis-Channel empfangen und an den WebSocket senden
    redisSubscriber.on("pmessage", (pattern, channel, message) => {
        console.log(`📢 Redis-Nachricht empfangen: ${message}`);

        try {
            const parsedMessage = JSON.parse(message);
            const receiverId = parsedMessage.receiver_id;
            if (clients[receiverId]) {
                clients[receiverId].send(JSON.stringify(parsedMessage)); // Nachricht an WebSocket-Client senden
                console.log(`📨 Nachricht an WebSocket-Client ${receiverId} gesendet.`);
            }
        } catch (error) {
            console.error("❌ Fehler beim Verarbeiten der Redis-Nachricht:", error.message);
        }
    });

    // WebSocket schließen und Redis unsubscriben
    connection.on("close", () => {
        console.log(`❌ WebSocket geschlossen für User ${userId}`);
        delete clients[userId];
        redisSubscriber.punsubscribe(chatKeyPattern1); // Abbestellen des Redis-Channel für userId als ersten Teilnehmer
        redisSubscriber.punsubscribe(chatKeyPattern2); // Abbestellen des Redis-Channel für userId als zweiten Teilnehmer
    });
});

    
}

