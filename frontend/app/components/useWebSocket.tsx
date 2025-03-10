import { useEffect, useState, useRef } from "react";

const DEFAULT_WORKSPACE_ID = "d0367c7e-50db-47ce-a740-3cef2140d183";

const useWebSocket = (workspaceId = DEFAULT_WORKSPACE_ID) => {
    const [todos, setTodos] = useState([]);
    const socketRef = useRef(null);
    const reconnectInterval = useRef(null);

    useEffect(() => {
        if (!workspaceId) return;

        const connectWebSocket = () => {
            const socket = new WebSocket(`ws://localhost:3000/chat/ws/workspace/d0367c7e-50db-47ce-a740-3cef2140d183`);
            console.log("Socket: " + socket);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ WebSocket verbunden:", workspaceId);
                clearInterval(reconnectInterval.current);
            };

            socket.onmessage = (event) => {
                try {
                    const todo = JSON.parse(event.data);
                    setTodos((prev) => [...prev, todo]);
                    console.log("📩 Neue Nachricht:", todo);
                } catch (error) {
                    console.error("⚠️ Fehler beim JSON-Parsing:", error);
                }
            };

            socket.onclose = () => {
                console.log("❌ WebSocket getrennt. Versuche Reconnect...");
                reconnectInterval.current = setTimeout(connectWebSocket, 3000);
            };

            socket.onerror = (error) => console.error("🚨 WebSocket-Fehler:", error);
        };

        connectWebSocket();

        return () => {
            socketRef.current?.close();
            clearInterval(reconnectInterval.current);
        };
    }, [workspaceId]);

    const sendTodo = async (workspaceId, todoText, token) => {
        const todo = { workspaceId, todo: todoText };
    
        try {
            const response = await fetch("http://localhost:3000/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(todo),
            });
    
            if (response.ok) {
                console.log("📤 Todo erfolgreich gesendet:", todo);
            } else {
                console.error("🚨 Fehler beim Senden des Todos:", await response.text());
            }
        } catch (error) {
            console.error("❌ Netzwerkfehler beim Senden des Todos:", error);
        }
    };
    

    return { todos, sendTodo };
};

export default useWebSocket;
