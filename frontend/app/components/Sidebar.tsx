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
  const [friends, setFriends] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

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

  const findUserWorkspaces = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3000/chat/userWorkspace", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert("GetWorkspaces process failed: " + error.error);
        return;
      } else {
        const data = await response.json();
        setWorkspaces(data.workspaces)
      }

      
    } catch (error) {
      console.error("Error during getWorkspaces process:", error);
    }
  }



  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    setToken(token);
    if (token) {
      getFriends(token)
      findUserWorkspaces(token)
    }
    
  }, [token]);

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

          {/* Logout-Button */}
          <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <Button className='loginButton' onPress={handleLogout}>Logout</Button>
          </div>

          {/* Button zum Umschalten zwischen Friends und Workspaces */}
          {activeView === 'friends' ? (
            <Button className='loginButton' onPress={() => setActiveView('workspaces')}>Zu Workspaces</Button>
          ) : (
            <Button className='loginButton' onPress={() => setActiveView('friends')}>Zu Friends</Button>
          )}
          

          {/* Hier wird die aktuelle Ansicht angezeigt */}
          {activeView === 'friends' && (
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <Button className='loginButton' onPress={() => router.push('/friends')}>Freunde verwalten</Button>
              {friends.length === 0 ? (
                <p>Keine Freunde gefunden</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {friends.map((friend) => (
                    <Button
                      key={friend.username}
                      className='sidebarButton'
                      style={{ marginTop: '0.5rem'}}
                    >
                      {friend.username}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeView === 'workspaces' && (
          <div>
            <Button
              style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
              className="loginButton"
              onPress={() => router.push('/newWorkspace')}
            >
              Workspaces verwalten
            </Button>

            {workspaces.length === 0 ? (
              <p>Keine Workspaces gefunden</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workspaces.map((workspace) => (
                  <Button
                    key={workspace.id}
                    className="sidebarButton"
                    style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                  >
                    {workspace.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      ) : (
        <div className="sidebar-list-items">
          <Button className='loginButton' onPress={() => router.push('/login')}>Login</Button>
        </div>
      )}
    </div>
  );
}

