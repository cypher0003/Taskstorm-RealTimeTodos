import { sendFriendRequest } from "../logik/friendLogik.mjs";
import { sendFriendRequestOptions } from "../schemas/friendSchema.mjs";
import { answerFriendRequestOptions } from "../schemas/friendSchema.mjs";
import { answerRequest } from "../logik/friendLogik.mjs";
import { searchFriendsOfUser } from "../logik/friendLogik.mjs";
import { searchFriendsOfUserOptions } from "../schemas/friendSchema.mjs";


export async function social_connection_service(fastify, options) {
    fastify.post("/addFriend", sendFriendRequestOptions, async(request, reply) =>{
        try{
            const currentUser = request.user;
            console.log("CCurrent User: ",currentUser)
            const {username} = request.body;
            console.log("user from body:", username)
            console.log("accessed service...")
            const friendRequestResult = await sendFriendRequest(fastify.db, currentUser, username)
            
            reply.code(201).send({friend:friendRequestResult})
        }
        catch(err)
        {
            console.log(err.message)
            reply.code(400).send({err: err.message})
        }
    });

    fastify.post("/answerRequest", answerFriendRequestOptions, async(request, reply) => {

        try{
            const currentUser = request.user;
            const {username, answer} = request.body

            console.log("current user is: ", currentUser.username);
            console.log("target with answer: ", username, "  + " ,answer)

            const decision = await answerRequest(fastify.db, currentUser, username, answer)
            reply.code(201).send({friend: decision})

        }catch(err)
        {
            console.log(err.message)
            reply.code(400).send({err: err.message})
        }
        

    });

    fastify.get("/getFriends", searchFriendsOfUserOptions, async (request, reply) => {
        try {
            const currentUser = request.user;
            if (!currentUser) {
                return reply.status(400).send({ error: "No user logged in..." });
            }
    
            const friends = await searchFriendsOfUser(fastify.db, currentUser.id);
    
            return reply.status(200).send(friends);
        } catch (error) {
            console.error("Fehler beim Abrufen der Freunde:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });
    
}