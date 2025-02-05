import { createUserOptions } from "../schemas/userSchema.mjs";
import { createUser } from "../logik/userLogik.mjs";
import { getUserByEmail } from "../logik/userLogik.mjs";
import { sha256 } from "js-sha256";
import { setUserOnline } from "../logik/userLogik.mjs";
import { setUserOffline } from "../logik/userLogik.mjs";
import fs from 'fs';
import path from 'path'


export async function authService(fastify, options)
{
      fastify.post("/createUser", async (request, reply) => {
          const parts = request.parts();  // Multipart-Parser von Fastify
          let fields = {};
          let profilePicturePath = null;
  
          for await (const part of parts) {
              if (part.file) {
                  // 📌 Datei speichern
                  const uploadDir = path.join(process.cwd(), "uploads/profile_pictures");
                  if (!fs.existsSync(uploadDir)) {
                      fs.mkdirSync(uploadDir, { recursive: true });
                  }
  
                  const filePath = path.join(uploadDir, part.filename);
                  await fs.promises.writeFile(filePath, await part.toBuffer());
  
                  profilePicturePath = `/uploads/profile_pictures/${part.filename}`;
              } else {
                  fields[part.fieldname] = part.value;
              }
          }
  
          // 📌 Validierung der Felder (da Fastify-Schema nicht für Multipart funktioniert)
          if (!fields.username || !fields.email || !fields.password) {
              return reply.code(400).send({ error: "Alle Felder sind erforderlich!" });
          }
  
          try {
              console.log("Trying to create user...");
              const userResult = await createUser(
                  fastify.db,
                  fields.username,
                  fields.email,
                  fields.password,
                  profilePicturePath
              );
  
              console.log("New User created:", userResult);
              reply.code(201).send({ user: userResult });
          } catch (error) {
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
          if (user.password !== sha256(password)) {
            reply.code(401).send({ error: "Invalid email or password" });
            return;
          }

          await setUserOnline(user.id)
          console.log("user set in redis to online")
    
          const token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            profile_picture : `http://localhost:3000${user.profile_picture}`,
            creation_date : user.creation_date
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

      fastify.post("/logout", async (request, reply) => {
        try {
            const userId = request.user.id;
            await setUserOffline(userId);
            reply.send({ message: "Logout erfolgreich" });
        } catch (error) {
            reply.code(500).send({ error: "Fehler beim Logout" });
        }
    });
}