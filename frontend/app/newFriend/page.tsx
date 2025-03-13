'use client'

import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewFriend() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        setToken(token);
    }, []);

    const sendFriendRequest = async () => {
        try {
            const response = await fetch("http://localhost:3000/friend/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert("Friend request process failed: " + error.error);
                return;
            } else {
                alert("Freundschaftsanfrage erfolgreich verschickt!");
                router.push("/home");
            }

        } catch (error) {
            console.error("Error during friend request process:", error);
        }
    }

    const onBack = () => {
        router.push("/home");
    }

    return(
        <div className="createBox">
            <h1>Freund hinzufügen</h1>
            <Input className="input" label="Username eingeben" value={username} onChange={(username) => setUsername(username.target.value)}></Input>
            <Button className="createButton" onPress={sendFriendRequest}>Anfrage schicken</Button>
            <br />
            <Button className="cancelButton" onPress={onBack}>Abbrechen</Button>
        </div>
    )
}