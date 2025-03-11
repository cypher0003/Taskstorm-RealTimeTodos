import { 

  sendToRedis, 
  getTodosOfWorkspace, 
  subscribeToMessages, 
  addFriendToWorkspace,
  createWorkspace,
  sendCachedTodos,
  updateTodo,
  deleteTodo,
  findAllWorkspacesForAUser
} from "../logik/todoLogik.mjs";
import { workSpaceToUserModel } from "../models/workSpaceModel.mjs";


export async function chatService(fastify, options) {

    const { redisPublisher, redisSubscriber } = fastify.redis;
    const clients = {}; 
  
    
    subscribeToMessages(redisSubscriber, clients);
  
    fastify.post("/send", sendMessageOptions, async (request, reply) => {
      try {
        const currentUser = request.user;
        const { workspaceId, todo } = request.body;
        if (!workspaceId || !todo) {
          return reply.status(400).send({ error: "Fehlende Parameter: workspaceId oder todo" });
        }
  
        await sendToRedis(fastify.db, redisPublisher, workspaceId, currentUser.id, todo);
        return reply.status(201).send({ todo: "Gesendet!" });
      } catch (error) {
        console.error("Fehler beim Senden des Todos:", error);
        return reply.status(500).send({ error: "Interner Serverfehler" });
      }
    });

    fastify.post("/workspace/create", async (request, reply) => {
        try {


          const { name } = request.body;
          
          const admin_id = request.user.id;
          
          const workspace = await createWorkspace(fastify.db, name, admin_id);
          
          reply.code(201).send({ workspace });
        } catch (error) {
          console.error("Fehler beim Erstellen des Workspaces:", error.message);
          reply.code(500).send({ error: "Interner Serverfehler" });
        }
      });
  
    fastify.get('/ws/workspace/:workspaceId', { websocket: true }, async (connection, req) => {
      const { workspaceId } = req.params;
      if (!workspaceId) {
        console.log("Fehler: Kein Workspace angegeben!");
        connection.close();
        return;
      }
  
      console.log(`WebSocket verbunden für Workspace ${workspaceId}`);

      if (!clients[workspaceId]) {
        clients[workspaceId] = [];
      }
      clients[workspaceId].push(connection);
  
      await sendCachedTodos(redisPublisher, workspaceId, connection);
  
      const channel = getWorkspaceChannel(workspaceId);
      redisSubscriber.subscribe(channel);
      console.log(`WebSocket-Client für Workspace ${workspaceId} hört auf Nachrichten vom Channel ${channel}`);
  
      connection.on("close", async () => {
        console.log(`WebSocket-Verbindung für Workspace ${workspaceId} geschlossen.`);
        clients[workspaceId] = clients[workspaceId].filter(client => client !== connection);

        if (clients[workspaceId].length === 0) {
          redisSubscriber.unsubscribe(channel);
        }
      });
    });
  
    fastify.get("/todos/:workspaceId", async (request, reply) => {
      try {
        const { workspaceId } = request.params;
        const todos = await getTodosOfWorkspace(fastify.db, workspaceId);
        if (!todos) {
          throw new Error("Keine Todos verfügbar");
        }
        reply.code(200).send({ items: todos });
      } catch (error) {
        console.error("Fehler beim Abrufen der Todos:", error);
        return reply.status(500).send({ error: "Interner Serverfehler" });
      }
    });

    fastify.post("/workspace/:workspaceId/addFriend", async (request, reply) => {
        try {

          const { workspaceId } = request.params;
          const { friendId } = request.body;
          const model = workSpaceToUserModel(workspaceId, friendId)
          const result = await addFriendToWorkspace(fastify.db, model.id,workspaceId, friendId);
          
          reply.code(201).send({ message: result });
        } catch (error) {
          console.error("Fehler beim Hinzufügen des Freundes zum Workspace:", error.message);
          reply.code(500).send({ error: "Interner Serverfehler" });
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
    })};

