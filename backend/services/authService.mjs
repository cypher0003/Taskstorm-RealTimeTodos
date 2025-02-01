import { createUserOptions } from "../schemas/userSchema.mjs";
import { createUser } from "../logik/userLogik.mjs";
import { getUserByEmail } from "../logik/userLogik.mjs";
import { sha256 } from "js-sha256";

export async function authService(fastify, options)
{
    fastify.post("/createUser", createUserOptions, async(request, reply) => {
        const createUserPayload = request.body;
        console.log("createUserPayload: ", createUserPayload.password)

        try{
            console.log("trying to create user...")
            const userResult = await createUser(fastify.db, createUserPayload.username,  createUserPayload.email, createUserPayload.password,)
            console.log("New User created: ", userResult)

            reply.code(201).send({user: userResult})
        }catch(error)
        {
            console.error("Error creating user:", error.message);
            reply.code(400).send({ error: error.message });
        }
    });

    fastify.post("/login", async (request, reply) => {
        const { email, password } = request.body;
    
        try {
          console.log("Eingegebene E-Mail:", email);
          const user = await getUserByEmail(fastify.db, email);
    
          console.log("found user: ", user)
          // Passwort prüfen
          if (user.password !== sha256(password)) {
            reply.code(401).send({ error: "Invalid email or password" });
            return;
          }
    
          const token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
          },
        {
          expiresIn:"99999m"
        });
    
       
          reply.send({ token });
        } catch (error) {
          console.error("Error logging in:", error.message);
          reply.code(401).send({ error: error.message });
        }
      });
}