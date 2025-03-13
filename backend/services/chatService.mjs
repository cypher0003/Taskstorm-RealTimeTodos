import fastify from "fastify";
import { 

  sendToRedis, 
  getTodosOfWorkspace, 
  subscribeToMessages, 
  addFriendToWorkspace,
  createWorkspace,
  sendCachedTodos,
  updateTodo,
  deleteTodo,
  findAllWorkspacesForAUser,
  leaveWorkspace
} from "../logik/todoLogik.mjs";
import { workSpaceToUserModel } from "../models/workSpaceModel.mjs";



export async function chatService(fastify, options) {
    const { redisPublisher, redisSubscriber } = fastify.redis;
    const clients = {};  // Speichert aktive WebSocket-Verbindungen

    subscribeToMessages(redisSubscriber, clients);

    // POST /workspace/create → Neuen Workspace erstellen
    fastify.post("/workspace/create", async (request, reply) => {
        try {
            const { name } = request.body;
            const admin_id = request.user.id; // Der aktuell eingeloggte Benutzer wird Admin
          
          const workspace = await createWorkspace(fastify.db, name, admin_id);
          
          reply.code(201).send({ workspace });
        } catch (error) {
            console.error("❌ Fehler beim Erstellen des Workspaces:", error.message);
            return reply.code(500).send({ error: "❌ Interner Serverfehler" });
        }
    });

    // POST /send → To-Do in Workspace senden
    fastify.post("/send", async (request, reply) => {
        try {
            const currentUser = request.user;
            const { workspaceId, todo } = request.body;
            if (!workspaceId || !todo) {
                return reply.status(400).send({ error: "Fehlende Parameter: workspaceId oder todo" });
            }

            await sendToRedis(fastify.db, redisPublisher, workspaceId, currentUser.id, todo);
            return reply.status(201).send({ message: "Nachricht gesendet!" });
        } catch (error) {
            console.error("Fehler beim Senden des Todos:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });

    // GET /todos/:workspaceId → Alle To-Dos eines Workspaces abrufen
    fastify.get("/todos/:workspaceId", async (request, reply) => {
        try {
            const { workspaceId } = request.params;
            const todos = await getTodosOfWorkspace(fastify.db, workspaceId);
            return reply.status(200).send({ items: todos });
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Todos:", error);
            return reply.status(500).send({ error: "❌ Interner Serverfehler" });
        }
    });

    // POST /workspace/:workspaceId/addFriend → Freund zu einem Workspace hinzufügen
    fastify.post("/workspace/:workspaceId/addFriend", async (request, reply) => {
        try {
            const { workspaceId } = request.params;
            const { friendId } = request.body;
            const model = workSpaceToUserModel(workspaceId, friendId);
            const result = await addFriendToWorkspace(fastify.db, model.id, workspaceId, friendId);
            return reply.code(201).send({ message: result });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Freundes zum Workspace:", error.message);
            return reply.code(500).send({ error: "Interner Serverfehler" });
        }

    });

    fastify.patch("/todos/update", async (request, reply) => {
        try {
            const { todoId, newText, newStatus } = request.body;
            if (!todoId || (!newText && !newStatus)) {
                return reply.status(400).send({ error: "Fehlende Parameter!" });
            }

            const updatedTodo = await updateTodo(fastify.db, redisPublisher, todoId, newText, newStatus);
            return reply.status(200).send({ message: "To-Do aktualisiert!", todo: updatedTodo });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des To-Dos:", error.message);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });

    fastify.delete("/todos/delete/:todoId", async (request, reply) => {
        try {
            const { todoId } = request.params;
            if (!todoId) {
                return reply.status(400).send({ error: "To-Do ID fehlt!" });
            }

            await deleteTodo(fastify.db, redisPublisher, todoId);
            return reply.status(200).send({ message: "To-Do gelöscht!" });
        } catch (error) {
            console.error("Fehler beim Löschen des To-Dos:", error.message);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });

    // WebSocket-Route → Clients verbinden sich mit einem Workspace
    fastify.get('/ws/workspace/:workspaceId', { websocket: true }, async (connection, req) => {
      try {
          const { workspaceId } = req.params;
  
          // 🔥 Token aus Query-Parameter holen
          const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get("token");
          if (!token) {
              console.log("Kein Token vorhanden!");
              connection.close();
              return;
          }
  
          // 🔥 JWT-Token verifizieren
          let user;
          try {
              user = fastify.jwt.verify(token);
          } catch (err) {
              console.log("Ungültiger Token:", err.message);
              connection.close();
              return;
          }
  
          console.log(`WebSocket verbunden für User ${user.id} in Workspace ${workspaceId}`);
  
          if (!clients[workspaceId]) {
              clients[workspaceId] = [];
          }
          clients[workspaceId].push(connection);
  
          // Jetzt wird `sendCachedTodos` für diesen Nutzer aufgerufen!
          await sendCachedTodos(redisPublisher, workspaceId, user.id, connection);
  
          const channel = `workspace:${workspaceId}`;
          redisSubscriber.subscribe(channel);
          console.log(`🔄 WebSocket-Client für Workspace ${workspaceId} hört auf Channel ${channel}`);
  
          connection.on("close", async () => {
              console.log(`WebSocket-Verbindung für User ${user.id} in Workspace ${workspaceId} geschlossen.`);
              clients[workspaceId] = clients[workspaceId].filter(client => client !== connection);
  
              if (clients[workspaceId].length === 0) {
                  redisSubscriber.unsubscribe(channel);
              }
          });
      } catch (err) {
          console.error("Fehler in WebSocket-Handler:", err.message);
          connection.close();
      }
  });
  
  fastify.get("/userWorkspace", async (request, reply) => {
        try {
            const user = request.user;
            const id = user.id;
            const workspaces = await findAllWorkspacesForAUser(fastify.db, id);
            return reply.status(200).send({ workspaces });
        } catch (error) {
            console.error("Fehler beim Abrufen der Workspaces:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    });
    fastify.delete("/leaveWorkspace/:workspaceId", async (request, reply) => {
        try {
            const user = request.user;
            const { workspaceId } = request.params;
            await leaveWorkspace(fastify.db, user.username, workspaceId);
            return reply.status(200).send({ message: "Workspace verlassen!" });
        } catch (error) {
            console.error("Fehler beim Verlassen des Workspaces:", error);
            return reply.status(500).send({ error: "Interner Serverfehler" });
        }
    }); 
};




