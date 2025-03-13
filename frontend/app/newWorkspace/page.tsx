'use client'

import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function NewWorkspace() {
    const router = useRouter();
    const [workspaceName, setWorkspaceName] = useState("");

    console.log("Fenster sollte angezeigt werden")

    const onClose = () => {
        router.back()
    }

    const createWorkspace = async () => {
        try {
            const response = await fetch("http://localhost:3000/workspace/createWorkspace", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({name: workspaceName}),
            });

            if (!response.ok) {
                const error = await response.json();
                alert("Workspace konnte nicht erstellt werden: " + error.error);
            } else {
                alert("Workspace wurde erfolgreich erstellt");
            }

        } catch (error) {
            console.error("Fehler beim Erstellen des Workspace:", error);
        }
    }

  return (
    
    <div className="createBox">
        <h1 className="createTitle">Neues Workspace erstellen</h1>
        <Input className="input" label="Workspace-Name" placeholder="Namen eingeben" value={workspaceName} onChange={(workspaceName) => setWorkspaceName(workspaceName.target.value)} />
            <Button className="createButton" onPress={createWorkspace}>Erstellen</Button>
            <br />
            <Button className="cancelButton" onPress={onClose}>Abbrechen</Button>
    </div>
  );
}