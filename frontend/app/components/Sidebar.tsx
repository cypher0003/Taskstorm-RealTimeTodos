'use client'

import { Button, user } from '@nextui-org/react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function Sidebar() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [activeView, setActiveView] = useState<"friends" | "workspaces">("friends");

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Logout process failed: " + error.error);
        return;
      }

    } catch (error) {
      console.error("Error during logout process:", error);
    }

    localStorage.removeItem("token");
    setToken(null);
    console.log("LocalStorage nach removeItem:", localStorage.getItem("token"));
    router.push("/login");
  }

  const getFriends = async () => {
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
      }

    } catch (error) {
      console.error("Error during getFriends process:", error);
    }
  }

  // const getWorkspaces = async () => {}

  const answerFriendRequest = async () => {
    try {
      const response = await fetch("http://localhost:3000/friends/answerFriendRequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: requestedFriend,
          answer: friendshipAnswer
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert("AnswerFriendRequest process failed: " + error.error);
        return;
      }

    } catch (error) {
      console.error("Error during answerFriendRequest process: ", error);
    }
  }

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    setToken(token);
  }, []);

  if (!hasMounted) {
    return null; 
  }

  return (
    <div className="sidebarContainer">
      <div className="sidebar-list-header">
        <h3 className="sidebar-title">TaskStorm</h3>
      </div>

      {/* Wenn User eingeloggt ist */}
      {token ? (
        <>
          {/* Button zum Umschalten zwischen Friends und Workspaces */}
          {activeView === 'friends' ? (
            <Button className='loginButton' onPress={() => setActiveView('workspaces')}>Zu Workspaces</Button>
          ) : (
            <Button className='loginButton' onPress={() => setActiveView('friends')}>Zu Friends</Button>
          )}

          {/* Hier wird die aktuelle Ansicht angezeigt */}
          {activeView === 'friends' && (
            <div>
              <p>Freunde-Liste</p>
            </div>
          )}
          {activeView === 'workspaces' && (
            <div style={{ marginTop: '1rem' }}>
              <p>Workspaces-Liste</p>
            </div>
          )}

          {/* Logout-Button */}
          <div style={{ marginTop: '1rem' }}>
            <Button onPress={handleLogout}>Logout</Button>
          </div>
        </>
      ) : (
        // Wenn kein Token -> Nur Login-Button anzeigen
        <div className="sidebar-list-items">
          <Button className='loginButton' onPress={() => router.push('/login')}>Login</Button>
        </div>
      )}
    </div>
  );
}

