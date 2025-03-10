'use client'

import { Button } from '@nextui-org/react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function Sidebar() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
  }, []);

  return (
    <div className="sidebarContainer">
      <div className="sidebar-list-header">
        <h3 className="sidebar-title">TaskForce</h3>
  
      </div>
      <div className="sidebar-list-items">
      {token ? (
            <Button className='loginButton' onPress={() => handleLogout}>Logout</Button>
        ) : (
          <Button className='loginButton' onPress={() => router.push("/login")} >Login</Button>
        )}
        //Hier kommen später die Workspaces hin 
      </div>
      <div className="sidebarButton">
        <PlusCircle className="addWorkspaceIcon" />
        <Button onPress={() => router.push("/newWorkspace")}>Workspace hinzufügen</Button>
      </div>
    </div>
  );
}

