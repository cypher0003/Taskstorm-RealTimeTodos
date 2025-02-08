

import { useState } from "react";
import useWebSocket from "./useWebSocket";

const DEFAULT_WORKSPACE_ID = "d0367c7e-50db-47ce-a740-3cef2140d183";

const Workspace = ({ workspaceId = DEFAULT_WORKSPACE_ID }) => {
    const [input, setInput] = useState("");
 
    const { todos, sendTodo } = useWebSocket(workspaceId);

    console.log("Aktuelles Workspace ID:", workspaceId);

    return (
        <div>
            <h2>Workspace: {workspaceId}</h2>
            <ul>
                {todos.map((td, index) => (
                    <li key={index}>{td.todoText}</li>
                ))}
            </ul>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Neues Todo"
            />
            <button onClick={() => sendTodo(DEFAULT_WORKSPACE_ID, input, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZiYmI1NWZkLWVkMmMtNDA3Yi05OGIwLTM1NDk2ZGM4NTE4MyIsInVzZXJuYW1lIjoia2V2aW4iLCJlbWFpbCI6ImtldmluQHRlc3QiLCJwcm9maWxlX3BpY3R1cmUiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvdXBsb2Fkcy9wcm9maWxlX3BpY3R1cmVzLzMxZDNjZmQyLTk5ZTItNDZlMi1iYWViLTUwMjYxNmJmM2E5NC53ZWJwIiwiY3JlYXRpb25fZGF0ZSI6IjIwMjUtMDItMDYiLCJpYXQiOjE3Mzg4NjIwODgsImV4cCI6MTc0NDg2MjAyOH0.MWpf4ws0YkSbyNLqz1pZ_2QUklRu0lffxquAq5bHzbQ")}>Senden</button>
        </div>
    );
};

export default Workspace;
