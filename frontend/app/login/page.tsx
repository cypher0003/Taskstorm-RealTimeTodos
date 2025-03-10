'use client'

import { Button, Card, CardBody, Input, Tab, Tabs } from "@nextui-org/react";
import { register } from "module";
import { useState } from "react";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    userName: "",
    email: "",
    password: ""
  });

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
        const error = await response.json();
        alert("Login process failed: " + error.error);
        return;
      } else {
        const token = data.token;
        localStorage.setItem("token", token);
        window.location.href = "http://localhost:4000/home";
      }

    } catch (error) {
      console.error("Error during login process:", error);
    }
  };
  
  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        const error = await response.json();
        alert("Register process failed: " + error.error);
        return;
      } else {
        await handleLogin(registerData.email, registerData.password);
      }

    } catch (error) {
      console.error("Error during register process:", error)
    }
  }

  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="tabs-container">
          <div className={activeTab === "login" ? "tab tab-active" : "tab"} onClick={() => setActiveTab("login")} >
            Einloggen
          </div>
          <div className={activeTab === "register" ? "tab tab-active" : "tab"} onClick={() => setActiveTab("register")} >
            Registrieren
          </div>
        </div>

        {activeTab === "login" && (
          <Card>
            <CardBody>
              <div className="inputBox">
                <Input label="E-Mail" placeholder="E-Mail eingeben" type="email" value={email} onChange={(email) => setEmail(email.target.value)} />
                <Input label="Passwort" placeholder="Passwort eingeben" type="password" value={password} onChange={(password) => setPassword(password.target.value)} />
                <Button className="loginB" onPress={() => handleLogin(email, password)}>Einloggen</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "register" && (
          <Card>
            <CardBody>
              <div className="inputBox">
                <Input label="Nutzername" placeholder="Nutzername eingeben" type="text" value={registerData.userName} onChange={(e) => setRegisterData({ ...registerData, userName: e.target.value })} />
                <Input label="E-Mail" placeholder="E-Mail eingeben" type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                <Input label="Passwort" placeholder="Passwort eingeben" type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                <Button className="loginB" onPress={handleRegister}>Registrieren</Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

