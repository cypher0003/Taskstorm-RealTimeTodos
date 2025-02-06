import { Button, Input } from "@nextui-org/react";


export default function NewWorkspace({ onClose }: { onClose: any }) {

    console.log("Fenster sollte angezeigt werden")

  return (
    
    <div className="create-box">
        <h1 className="create-title">Neues Workspace</h1>
        <Input className="input" label="Workspace-Name" placeholder="Workspace-Namen eingeben" />
        <div className="button-group">
            <Button className="createButton">Erstellen</Button>
            <Button className="cancelButton" onPress={onClose}>Abbrechen</Button>
        </div>
    </div>
  );
}