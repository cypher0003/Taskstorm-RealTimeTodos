'use client';

import { useState } from "react";
import useWebSocket from "./useWebSocket";
import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

const DEFAULT_WORKSPACE_ID = "d0367c7e-50db-47ce-a740-3cef2140d183";

interface Todo {
    id: string;
    name: string;
    adminId: string;
    status: string;
    creationDate: string;
    updateDate: string;
}

export default function Workspace({ workspaceId = DEFAULT_WORKSPACE_ID }) {
    const [input, setInput] = useState("");
 
    const { todos, sendTodo } = useWebSocket(workspaceId);

    console.log("Aktuelles Workspace ID:", workspaceId);

    return (
        <div className="customTable-wrapper">
            <h2 className="createTitle">To-Do Liste</h2>
            <Table className="customTable">
                <TableHeader>
                    <TableColumn>Creator ID</TableColumn>
                    <TableColumn>To-Do</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Timestamp</TableColumn>
                    <TableColumn>Updated At</TableColumn>
                </TableHeader>
                <TableBody>
                    {todos.map((todo: Todo) => (
                        <TableRow key={todo.id}>
                            <TableCell>{todo.adminId}</TableCell>
                            <TableCell>{todo.name}</TableCell>
                            <TableCell>{todo.status}</TableCell>
                            <TableCell>{todo.creationDate}</TableCell>
                            <TableCell>{todo.updateDate}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}