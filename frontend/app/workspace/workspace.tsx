'use client';

import { useEffect, useState, useRef } from "react";
import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Trash, Check, ArrowRight } from "lucide-react";

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
  const [members, setMembers] = useState<any[]>([]);
  const [membersWindow, setMembersWindow] = useState<boolean>(false);


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
        console.log("Friends:", data);
        setFriends(data)
      }

    } catch (error) {
      alert("Fehler beim Laden der Freunde: " + error);
      console.error("Error during getFriends process:", error);
    }
  }

  const getWorkspaceMembers = async () => {
    console.log("Wird ausgeführt");
    try {
      const response = await fetch(`http://localhost:3000/chat/workspace/${workspaceId}/members`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      console.log("Fetch ging durch")

      if (!response.ok) {
        console.log("Response ist nicht ok")
        throw new Error("Fehler beim Abrufen der Workspace-Mitglieder");
      } else {
        console.log("Response ist ok")
        const data = await response.json();
        setMembers(data.members);
        console.log("Workspace-Mitglieder:", data);}

      } catch (error) {
        alert("Fehler beim Abrufen der Workspace-Mitglieder: " + error);
        console.error("Fehler beim Abrufen der Workspace-Mitglieder:", error);
      }
    }

  useEffect(() => {
    if (!token) {
      return
    }

    getFriends(token);
    getWorkspaceMembers();
    getTodos();
    

    ws.current = new WebSocket(`ws://localhost:3000/chat/ws/workspace/${workspaceId}?token=${token}`);
    console.log("Neue WebSocket-Verbindung erstellt");

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.current.onmessage = (event) => {
      console.log("WebSocket message received:", event.data,)
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
      alert("Fehler beim Senden des Todos " + error);
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
      alert("Fehler beim Aktualisieren des Todos: " + error);
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
      alert("Fehler beim Löschen des Todos" + error);
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
      } else {
        getWorkspaceMembers()
      }

    } catch (error) {
        alert("Fehler beim Hinzufügen des Freundes zum Workspace: " + error);
        console.error("Fehler beim Hinzufügen des Freundes zum Workspace:", error
      );
    }
  }

  const kickUser = async (username: string, workspaceId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/kickUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          "workspace_id": workspaceId,
          "username": username
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Kicken des Freundes aus dem Workspace");
      } else {
        getWorkspaceMembers()
      }


    } catch (error) {
      alert("Fehler beim Kicken des Users: " + error);
      console.error("Fehler beim Kicken des Users:", error);
    }
  }

  const switchRole = async (member: any) => {
    const newRole = member.role === "ADMIN" ? "MEMBER" : "ADMIN";
  
    try {
      const response = await fetch("http://localhost:3000/chat/changeMemberRole", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          username: member.username,
          newRole: newRole,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Fehler beim Ändern der Rolle");
      } else {
        getWorkspaceMembers()
      }
      
    } catch (error) {
      alert("Fehler beim Ändern der Rolle: " + error);
      console.error(error);
    }
  };
  

  

  const leaveWorkspace = () => {
    if (ws.current) {
      ws.current.close();
      router.push("/home");
    } else {
      router.push("/home");
    }
  }

  const openCollaborators = () => {
    setMembersWindow(true);
  }


  return (
    <>
      <div className="sidebarContainer">
        <div className="sidebarHeader">
            <h3 className="sidebarTitle">Freunde</h3>
            <br />
            <h4 className="sidebarText">Klicken zum Hinzufügen</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {friends
            .filter(friend => !members.some(member => member.id === friend.id))
            .map((friend) => (
              <Button
                onPress={() => addFriendToWorkspace(friend.id, workspaceId)}
                key={friend.username}
                className="sidebarButton"
                style={{ marginTop: '0.5rem' }}
              >
                {friend.username}
                <ArrowRight />
              </Button>
          ))}
        </div>
      </div>
      {membersWindow ? (
        <>
          <Button className="cancelButton" onPress={() => setMembersWindow(false)}>Schließen</Button>
          <div className="friendsWindow">
            <h2 className="createTitle">Mitgliederverwaltung</h2>
            <div className="customTableWrapper">
              <Table className="customTable">
                <TableHeader>
                  <TableColumn>Freund</TableColumn>
                  <TableColumn>Rolle</TableColumn>
                  <TableColumn>Aktionen</TableColumn>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.username}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                      <Button 
                        className="createButton" 
                        onPress={() => switchRole(member)}
                      >
                        {member.role === "ADMIN" ? "Zu MEMBER machen" : "Zu ADMIN machen"}
                      </Button>
                        <Button className="cancelButton" onPress={() => kickUser(member.username, workspaceId)}>Kicken</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <>
          <Button className="cancelButton" onPress={leaveWorkspace}>Verlassen</Button>
          <Button className="createButton" onPress={openCollaborators}>Mitglieder</Button>
          
          <div className="createBox">
            <Input className="input" label="Neues To-Do" value={todo} onChange={(todo) => setTodo(todo.target.value)}/>
            <Button className="createButton" onPress={sendTodo}>Absenden</Button>
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
                        <Check className="checkButton" onClick={() => updateTodoStatus(item.id)} size={24}/>
                      )}
                      <br />
                      <Trash className="trashButton" onClick={() => deleteTodo(item.id)} size={24}/>
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
