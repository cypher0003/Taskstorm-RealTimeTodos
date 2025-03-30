'use client'

import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "lucide-react"

export default function Friends() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>("");
    const [friends, setFriends] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);


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
            console.log("Friends:", data);
          }
    
    
        } catch (error) {
          console.error("Error during getFriends process:", error);
        }
    }

    const getFriendRequests = async (token: string) => {
        try {
            const response = await fetch("http://localhost:3000/friends/getFriendRequests", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                alert("GetFriendRequests process failed: " + error.error);
                return;
            } else {
                const data = await response.json();
                setFriendRequests(data);
                console.log("Friend Requests:", data);
            }

        } catch (error) {
            console.error("Error during getFriendRequests process:", error);
        }
    }

    const sendFriendRequest = async () => {
        try {
            const response = await fetch("http://localhost:3000/friends/addFriend", {
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

    const answerFriendRequest = async (username: string, answer: string) => {
        try {
          const response = await fetch("http://localhost:3000/friends/answerRequest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              username,
              answer
            }),
          });
    
          if (!response.ok) {
            const error = await response.json();
            alert("AnswerFriendRequest process failed: " + error.error);
            return;
          } else {
            const data = await response.json();
            window.location.reload();
          }
          
        } catch (error) {
          console.error("Error during answerFriendRequest process:", error);
        }
      }

    useEffect(() => {
        const token = localStorage.getItem("token");
        setToken(token);
        if (token) {
            getFriends(token);
            getFriendRequests(token);
        }
        
    }, []);

    const onBack = () => {
        router.push("/home");
    }

    return(
        <>
            <div className="sidebarContainer">
                <div className="sidebarHeader">
                    <h3 className="sidebarTitle">Freunde</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {friends.map((friend) => (
                        <Button
                            key={friend.username}
                            className="sidebarButton"
                            style={{ marginTop: '0.5rem' }}
                        >
                            <User/>
                            {friend.username}
                        </Button>
                    ))}
                </div>
            </div>
            <Button className="cancelButton" onPress={() => router.push("/home")}>Verlassen</Button>
            <div className="createBox">
                <h1 className="createTitle">Freund hinzufügen</h1>
                <Input className="input" label="Username" placeholder="Namen eingeben" value={username} onChange={(username) => setUsername(username.target.value)} />
                <Button className="createButton" onPress={sendFriendRequest}>Anfrage schicken</Button>
                <br />
                <Button className="cancelButton" onPress={onBack}>Abbrechen</Button>
            </div>
            <div className="customTable-wrapper">
                <h2 className="createTitle">Offene Freundschaftsanfragen</h2>
                <Table className="customTable">
                    <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>Username</TableColumn>
                        <TableColumn>Email</TableColumn>
                        <TableColumn>Annehmen</TableColumn>
                        <TableColumn>Ablehnen</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {friendRequests.map((friendRequests) => (
                            <TableRow key={friendRequests.id}>
                                <TableCell>{friendRequests.id}</TableCell>
                                <TableCell>{friendRequests.username}</TableCell>
                                <TableCell>{friendRequests.email}</TableCell>
                                <TableCell>
                                    <Button
                                        className="acceptButton"
                                        onPress={() => answerFriendRequest(friendRequests.username, "ACCEPT")}
                                    >
                                        Annehmen
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        className="rejectButton"
                                        onPress={() => answerFriendRequest(friendRequests.username, "DENY")}
                                        style={{ marginLeft: "8px" }}
                                    >
                                        Ablehnen
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </> 
    )
}