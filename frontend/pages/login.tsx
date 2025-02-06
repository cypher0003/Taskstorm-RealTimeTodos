import { Button, Card, CardBody, Input, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    userName: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(email)
      console.log(password)
    
      const data = await response.json();
      const token = data.token;
      console.log("Received Token:", token);

      localStorage.setItem("token", token);

      if (!response.ok) {
        const error = await response.json();
        alert("Login process failed: " + error.error);
        return;
      }

      window.location.href = "http://localhost:4000";

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
        body: JSON.stringify(registerData)
      })

      if (!response.ok) {
        const error = await response.json();
        alert("Register process failed: " + error.error);
        return;
      }

    } catch (error) {
      console.error("Error during register process:", error)
    }
  }

  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="box">
      <div className="tabs-container">
        <div
          className={(function() {
            if (activeTab === "login") {
              return "tab tab-active";
            } else {
              return "tab";
            }
          })()}
          onClick={function() {setActiveTab("login");}}>Einloggen
        </div>
        <div
          className={(function() {
            if (activeTab === "register") {
              return "tab tab-active";
            } else {
              return "tab";
            }
          })()}
          onClick={function() {setActiveTab("register")}}>Registrieren
        </div>
      </div>

      {activeTab === "login" && (
        <Card>
          <CardBody>
            <div className="input">
              <Input label="E-Mail" placeholder="E-Mail eingeben" type="email" value={email} onChange={(email) => setEmail(email.target.value)}/>
              <Input label="Passwort" placeholder="Passwort eingeben" type="password" value={password} onChange={(password) => setPassword(password.target.value)}/>
              <Button className="loginButton" onPress={handleLogin}>Einloggen</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === "register" && (
        <Card>
          <CardBody>
            <div className="input">
              <Input label="Nutzername" placeholder="Nutzername eingeben" type="text" value={registerData.userName} onChange={(userName) => setRegisterData({...registerData, userName: userName.target.value})}/>
              <Input label="Vorname" placeholder="Vorname eingeben" type="text" value={registerData.firstname} onChange={(firstname) => setRegisterData({...registerData, firstname: firstname.target.value})}/>
              <Input label="Nachname" placeholder="Nachname eingeben" type="text" value={registerData.lastname} onChange={(lastname) => setRegisterData({...registerData, lastname: lastname.target.value})}/>
              <Input label="E-Mail" placeholder="E-Mail eingeben" type="email" value={registerData.email} onChange={(email) => setRegisterData({...registerData, email: email.target.value})}/>
              <Input label="Telefonnummer" placeholder="Telefonnummer eingeben" type="tel" value={registerData.phone} onChange={(phone) => setRegisterData({...registerData, phone: phone.target.value})}/>
              <Input label="Passwort" placeholder="Passwort eingeben" type="password" value={registerData.password} onChange={(password) => setRegisterData({...registerData, password: password.target.value})}/>
              <Button className="loginButton" onPress={handleRegister}>Registrieren</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

