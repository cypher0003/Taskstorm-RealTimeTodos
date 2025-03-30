Das hier ist eine Prüfungsleistung der DHBW Heidenheim
ALLE Ordner sind zu benoten.

Ausführung:

1. Repository clonen:
  git clone https://github.com/cypher0003/Taskstorm-RealTimeTodos.git
2. Ordner in VSCode öffnen.
3. In den backend-Ordner navigieren (cd backend)
4. "docker-compose build --no-cache" ausführen
5. danach "docker-compose up" ausführen
6. Inkognito-Tab im Browser öffnen
7. UI ist unter localhost:4000 erreichbar (http://localhost:4000/login)
8. Registrieren (Profilbild ist optional)
   ![image](https://github.com/user-attachments/assets/583263d4-f62e-4c3b-9a12-52237d906ba8)
9. Mehrere User anlegen, um Freundschaften simulieren zu können
10. Freunde hinzufügen unter "Freunde verwalten" --> Usernamen eines anderen User in das Input-Feld eingeben und Anfrage abschicken
    ![image](https://github.com/user-attachments/assets/4b6a6774-6a81-43fa-9112-dfabd0bbb978)
11. Freundschaftsanfragen MÜSSEN dann von den jeweiligen Accounts angenommen werden
    ![image](https://github.com/user-attachments/assets/862f5732-be16-484d-82c7-a9f27ca668af)
12. In der Sidebar zu Workspaces wechseln
13. Workspace erstellen (Workspace-Namen im Input-Feld eingeben)
    ![image](https://github.com/user-attachments/assets/2d1c1d31-c2f1-4a9f-9248-424ae5f2efda)
14. Workspace öffnen (in der Sidebar)
15. Todos hinzufügen
    ![image](https://github.com/user-attachments/assets/8e6a69ed-9368-4f23-aee0-013baaebc79a)
    ANMERKUNG:
    Falls angelegte Todos nach einem erneuten Beitreten in den Workspace nicht mehr gefetcht werden, bitte den Docker-Container neu ausführen (Schritt 4 und 5).       Dies ist ein Docker-Fehler, der aufgrund des Zeitmangels nicht mehr behandelt werden konnte.
    Vorsichtshalber davor das Logout benutzen, damit der Token gelöscht wird.
17. Auf "Mitglieder" klicken --> Mitgliederverwaltung wird geöffnet
    ![image](https://github.com/user-attachments/assets/92d9808a-18d2-4c94-a144-5411f4cdae74)
18. Hier kann man Freunde hinzufügen (aufgrund dessen bitte unbedingt mehrere User anlegen)
19. Man kann Mitgliederrollen wechseln und diese als Owner und Admin aus dem Workspace kicken
    ![image](https://github.com/user-attachments/assets/e7f969fd-4055-438a-a436-7ce5d3341a2e)









