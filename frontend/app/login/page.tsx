"use client"

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useRef, useState } from "react";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",

  });

  const [profilePic, setProfilePic] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
    }
  };


  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Login process failed: " + data.error);
        return;
      } else {
        const token = data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("userName", data.username);
        window.location.href = "http://localhost:4000/home";
      }

    } catch (error) {
      console.error("Error during login process:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const formData = new FormData();
      formData.append("username", registerData.username);
      formData.append("email", registerData.email);
      formData.append("password", registerData.password);

      if (profilePic) {
        formData.append("profile_picture", profilePic);
      }

      const response = await fetch("http://localhost:3000/user/createUser", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Register process failed: " + error.error);
        return;
      } else {
        await handleLogin(registerData.email, registerData.password);
      }

    } catch (error) {
      console.error("Error during register process:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="tabs-container">
          <div
            className={activeTab === "login" ? "tab tab-active" : "tab"}
            onClick={() => setActiveTab("login")}
          >
            Einloggen
          </div>
          <div
            className={activeTab === "register" ? "tab tab-active" : "tab"}
            onClick={() => setActiveTab("register")}
          >
            Registrieren
          </div>
        </div>

        {activeTab === "login" && (
          <Card>
            <CardBody>
              <div className="inputBox">
                <Input style={{ width: "100%" }} className="input" label="E-Mail" placeholder="E-Mail eingeben" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input style={{ width: "100%" }} className="input" label="Passwort" placeholder="Passwort eingeben" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button className="loginB" onPress={() => handleLogin(email, password)}>Einloggen</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "register" && (
          <Card>
            <CardBody>
              <div className="inputBox">
                <Input style={{ width: "165%" }} className="input" label="Nutzername" placeholder="Nutzername eingeben" type="text" value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                />
                <Input style={{ width: "165%" }} className="input" label="E-Mail" placeholder="E-Mail eingeben" type="email" value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                />
                <Input style={{ width: "165%" }} className="input" label="Passwort" placeholder="Passwort eingeben" type="password" value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                />
                <input className="createButton" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ marginBottom: "1rem" }}/>
                <Button className="loginB" onPress={handleRegister}>Registrieren</Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}