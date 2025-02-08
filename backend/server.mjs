import Fastify from "fastify";
import {redisPublisher, redisSubscriber} from "./database/redis.mjs";
import { dbConnector } from "./database/sqlite.mjs";
import { authService } from "./services/authService.mjs";
import { userSchema } from "./schemas/userSchema.mjs";
import {fastifyJwt as jwt} from "@fastify/jwt";
import { isPublicRoute } from "./helper/server_helper/publicRoutes.mjs";
import { friendSchema } from "./schemas/friendSchema.mjs";
import { social_connection_service } from "./services/social_connection_service.mjs";
import { messageSchema } from "./schemas/chatSchema.mjs";
import { chatService } from "./services/chatService.mjs";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from 'path'

const fastify = Fastify({
    logger: true,
  });

  fastify.register(fastifyMultipart)
  fastify.register(fastifyWebsocket)
  fastify.register(fastifyCors)
  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "./uploads/profile_pictures"), 
    prefix: "/uploads/profile_pictures/", 
});
  fastify.decorate("redis", {redisPublisher, redisSubscriber})


  fastify.addSchema(userSchema)
  fastify.addSchema(friendSchema)
  fastify.addSchema(messageSchema)

  fastify.register(jwt, {
    secret: "lskadjf"
  })
  fastify.register(dbConnector);

  fastify.register(authService, {prefix: "/user"})
  fastify.register(social_connection_service, {prefix: "/friends"})
  fastify.register(chatService, {prefix: "/chat"})


  fastify.addHook("onRequest", async (request, reply) => {
    const publicRoutes = [
        "/user/createUser",
        "/user/login",
        "/ws/messages",
        "/uploads/profile_pictures",
        "/favicon.ico"
    ];

    console.log("Request erhalten:", request.url);

    if (request.url.startsWith("/uploads/profile_pictures/")) {
      console.log("📂 Statische Datei erkannt, Zugriff erlaubt:", request.url);
      return;
  }
    
    if (request.headers.upgrade?.toLowerCase() === "websocket") {
        console.log("WebSocket erkannt, Authentifizierung übersprungen:", request.url);
        return;
    }

    
    if (isPublicRoute(request.url, publicRoutes)) {
        console.log("Öffentliche Route erkannt:", request.url);
        return;
    }

    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new Error("Authorization header missing");
        }

        const token = authHeader.split(" ")[1];
        const user = fastify.jwt.verify(token);
        request.user = user;
        console.log("🔓 Authentifizierung erfolgreich:", request.user.id);
    } catch (err) {
        console.error("Unauthorized:", err.message);
        reply.code(401).send({ error: "401 Unauthorized" });
    }
});

  try {
    await fastify.listen({ port: 3000 });
    fastify.ready((err) => {
      if (err) throw err;
      console.log(fastify.printRoutes());
    });
  
    console.log("Server läuft auf http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  