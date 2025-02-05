import {
    sendToRedis,
    getMessages,
    sendCachedTodos,
    subscribeToMessages,
} from "../logik/chatLogik.mjs";

import { sendMessageOptions, getMessagesOptions } from "../schemas/chatSchema.mjs";

export async function chatService(fastify, options) {
    const { redisPublisher, redisSubscriber } = fastify.redis;
    const clients = {}; 
    
    fastify.post("/send", sendMessageOptions, async (request, reply) => {
        try {
            const currentUser = request.user;
            const sender_id = currentUser.id;
            const { receiver_id, todo } = request.body;

            if (!sender_id || !receiver_id || !todo) {
                return reply.status(400).send({ error: "Fehlende Parameter" });
            }

            await sendToRedis(fastify.db, redisPublisher, sender_id, receiver_id, todo);
            return reply.status(201).send({ todo: "Gesendet!" });

        } catch (error) {
            console.error("Fehler beim Senden der Nachricht:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });

   
    fastify.get('/ws/tasks/:userId', { websocket: true }, async (connection, req) => {
        const { userId } = req.params;
        if (!userId) {
            console.log("Fehler: Keine User-ID übergeben!");
            connection.close();
            return;
        }

        console.log(`WebSocket verbunden für Benutzer ${userId}`);
        clients[userId] = connection;

        // 🔍 Online-Status in Redis setzen
        await redisPublisher.set(`user:${userId}:status`, "online", "EX", 600);

        // 📩 Falls ungelesene Nachrichten existieren, senden
        await sendCachedTodos(redisPublisher, userId, connection);

       
        const chatKeyPattern1 = `tasks:taskSpace_${userId}_*`; 
        const chatKeyPattern2 = `tasks:taskSpace_*_${userId}`;

        redisSubscriber.psubscribe(chatKeyPattern1);
        redisSubscriber.psubscribe(chatKeyPattern2);

        

        console.log(` WebSocket-Client ${userId} hört auf Nachrichten aus: ${chatKeyPattern1}, ${chatKeyPattern2}`);

        
        subscribeToMessages(redisSubscriber, clients);

        console.log("subscribing done...")

        connection.on("close", async () => {
            console.log(`WebSocket geschlossen für Benutzer ${userId}`);
            delete clients[userId];

            redisSubscriber.punsubscribe(chatKeyPattern1);
            redisSubscriber.punsubscribe(chatKeyPattern2);

          
            await redisPublisher.del(`user:${userId}:status`);
        });
    });

   
    fastify.get("/messages/:userA/:userB", getMessagesOptions, async (request, reply) => {
        try {
            const {userA, userB} = request.params;
            const chatHistory = await getMessages(fastify.db, userA, userB)

            if(!chatHistory)
            {
                throw new Error("No Chat available")
            }

            reply.code(201).send({items: chatHistory})

        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Nachrichten:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });
}
