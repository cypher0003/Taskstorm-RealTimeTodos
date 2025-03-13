
import { sendFriendRequest, answerRequest, searchFriendsOfUser, findAllFriendRequests } from "../logik/friendLogik.mjs";
import { sendFriendRequestOptions, answerFriendRequestOptions, searchFriendsOfUserOptions } from "../schemas/friendSchema.mjs";

export async function social_connection_service(fastify, options) {
    fastify.post("/addFriend", sendFriendRequestOptions, async(request, reply) => {
        try {
            const currentUser = request.user;
            const { username } = request.body;
            const friendRequestResult = await sendFriendRequest(fastify.db, currentUser, username);
            reply.code(201).send({ friend: friendRequestResult });
        } catch (err) {
            console.error("❌ Fehler beim Senden der Freundschaftsanfrage:", err.message);
            reply.code(400).send({ error: err.message });
        }
    });

    fastify.post("/answerRequest", answerFriendRequestOptions, async(request, reply) => {
        try {
            const currentUser = request.user;
            const { username, answer } = request.body;
            const decision = await answerRequest(fastify.db, currentUser, username, answer);
            reply.code(201).send({ friend: decision });
        } catch (err) {
            console.error("❌ Fehler beim Beantworten der Freundschaftsanfrage:", err.message);
            reply.code(400).send({ error: err.message });
        }
    });

    fastify.get("/getFriends", searchFriendsOfUserOptions, async (request, reply) => {
        try {
            const currentUser = request.user;
            const friends = await searchFriendsOfUser(fastify.db, currentUser.id);
            return reply.status(200).send(friends);
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Freunde:", error);
            return reply.status(500).send({ error: "❌ Interner Serverfehler" });
        }
    });


    fastify.get("/getFriendRequests", async (request, reply) => {
        try {
            const currentUser = request.user;
            const friendRequests = await findAllFriendRequests(fastify.db, currentUser.id);
            return reply.status(200).send(friendRequests);
        } catch (error) {
            console.error("Fehler beim Abrufen der Freundschaftsanfragen:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });


}

