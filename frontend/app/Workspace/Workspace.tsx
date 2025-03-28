'use client';

import { useEffect, useState, useRef } from "react";
import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Trash, Check } from "lucide-react";

interface Todo {
    id: string;
    workspace_id: string;
    creator_id: string;
    todo: string;
    status: string;
    timestamp: string;
  }

interface TodoApiResponse {
  items: Todo[];
}

export default function Workspace({ workspaceId }: { workspaceId: string }) {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const token = localStorage.getItem("token");
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsWindow, setFriendsWindow] = useState<boolean>(false);

  const getTodos = async () => {
    try {
      const response = await fetch(`http://localhost:3000/chat/todos/${workspaceId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Todos");
      }
      const data: TodoApiResponse[] = await response.json();
      console.log("Todos:", data);
      setTodos(data.items);
    } catch (error) {
      console.error("Error during getTodos process:", error);
    }
  };

  const getFriends = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3000/friends/getFriends", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert("GetFriends process failed: " + error.error);
        return;
      } else {
        const data = await response.json();
        setFriends(data)
      }


    } catch (error) {
      console.error("Error during getFriends process:", error);
    }
  }

  useEffect(() => {
    getTodos();

    if (!token) return;

    ws.current = new WebSocket(`ws://localhost:3000/chat/ws/workspace/${workspaceId}?token=${token}`);

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
    
        setTodos((prevTodos) => {
          if (messageData.action === "update") {
            const updated = messageData.todo;
            return prevTodos.map((t) => (t.id === updated.id ? updated : t));
          } else if (messageData.action === "delete") {
            const deletedId = messageData.todoId;
            return prevTodos.filter((t) => t.id !== deletedId);
          } else {
            return [...prevTodos, messageData];
          }
        });
      } catch (error) {
        console.error("Fehler beim Verarbeiten der WebSocket-Nachricht:", error);
      }
    };
    

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [workspaceId, token]);



const sendTodo = async () => {
  try {
    if (!token) {
      console.error("Kein Token vorhanden");
      return;
    }

    const response = await fetch("http://localhost:3000/chat/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        workspaceId,
        todo,
      }),
    });

    setTodo("");

    if (!response.ok) {
      throw new Error("Fehler beim Senden des Todos");
    }

    
  } catch (error) {
    console.error("Fehler beim Senden des Todos:", error);
  }
};

  const updateTodoStatus = async (todoId: string) => {
    try {
      if (!token) {
        console.error("Kein Token vorhanden");
        return;
      }

      const response = await fetch("http://localhost:3000/chat/todos/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          todoId,
          newStatus: "DONE",
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Todos");
      }

    } catch (error) {
      console.error("Fehler beim Aktualisieren des Todos:", error);
    }
  }

  const deleteTodo = async (todoId: string) => {
    try {
      if (!token) {
        console.error("Kein Token vorhanden");
        return;
      }

      const response = await fetch(`http://localhost:3000/chat/todos/delete/${todoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          todoId,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen des Todos");
      }

    } catch (error) {
      console.error("Fehler beim Löschen des Todos:", error);
    }
  }

  const addFriendToWorkspace = async (friendId: string, workspaceId: string) => {
    try {
      if (!token) {
        console.error("Kein Token vorhanden");
        return;
      }

      const response = await fetch(`http://localhost:3000/chat/workspace/${workspaceId}/addFriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          friendId,
          workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Hinzufügen des Freundes zum Workspace");
      }

    } catch (error) {
        console.error("Fehler beim Hinzufügen des Freundes zum Workspace:", error
      );
    }
  }

  const leaveWorkspace = () => {
    if (ws.current) {
      ws.current.close();
      router.push("/home");
    } else {
      router.push("/home");
    }
  }

  const openCollaborators = () => {
    console.log("Öffne Mitglieder");
    setFriendsWindow(true);
  }
  

  useEffect(() => {
    if (token) {
      getTodos();
      getFriends(token);
    }
  }, [workspaceId, token]);

  return (
    <>
      {friendsWindow ? (
        <>
          <Button className="cancelButton" onPress={() => setFriendsWindow(false)}>Schließen</Button>
          <div className="friendsWindow">
            <h2 className="createTitle">Freunde zum Workspace hinzufügen</h2>
            <div className="customTableWrapper">
              {friends.map((friend) => (
                <div key={friend.id} className="friend">
                  <Table className="customTable">
                    <TableHeader>
                      <TableColumn>Freund</TableColumn>
                      <TableColumn>Hinzufügen</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {friends.map((friend) => (
                        <TableRow key={friend.id}>
                          <TableCell>{friend.username}</TableCell>
                          <TableCell>
                            <Button className="createButton" onPress={() => addFriendToWorkspace(friend.id, workspaceId)}
                            >Hinzufügen</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <Button className="cancelButton" onPress={leaveWorkspace}>Verlassen</Button>
          <Button className="createButton" onPress={openCollaborators}>Mitglieder</Button>
            <div className="createBox">
              <Input
                className="input"
                label="Neues To-Do"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
              />
              <Button className="createButton" onPress={sendTodo}>
                Absenden
              </Button>
            </div>

            <div className="customTable-wrapper">
              <h2 className="createTitle">To-Do Liste</h2>
              <Table className="customTable">
                <TableHeader>
                  <TableColumn>Erstellt von</TableColumn>
                  <TableColumn>To-Do</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Erstellt am</TableColumn>
                  <TableColumn>Aktionen</TableColumn>
                </TableHeader>
                <TableBody>
                  {todos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.creator_id}</TableCell>
                      <TableCell>{item.todo}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.timestamp}</TableCell>
                      <TableCell>
                        {item.status === "DONE" ? (
                          <p>Erledigt</p>
                        ) : (
                          <Check
                            className="checkButton"
                            onClick={() => updateTodoStatus(item.id)}
                            size={24}
                          />
                        )}
                        <br />
                        <Trash
                          className="trashButton"
                          onClick={() => deleteTodo(item.id)}
                          size={24}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </>
      )}
    </>
  );
}
