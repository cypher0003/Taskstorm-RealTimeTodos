import { getUserByUsername } from "./userLogik.mjs";
import { answerRequestEnum } from "../enums/answerRequest.mjs";
import { friendModel } from "../models/friendModel.mjs";

export async function sendFriendRequest(db, currentUser, targetUser) {
    try {
        if (currentUser.username === targetUser) {
            throw new Error("Du kannst dich nicht selbst hinzufügen.");
        }

        const targetFriend = await getUserByUsername(db, targetUser);
        console.log(`Sende Freundschaftsanfrage an ${targetFriend.username}`);

        const checkStmt = db.prepare(`
            SELECT * FROM Friendships
            WHERE sender_id = ? AND receiver_id = ? 
        `);
        const existingRequest = checkStmt.get(currentUser.id, targetFriend.id);
      if(existingRequest)
      {
        throw new Error("Freundschaftsanfrage bereits gesendet oder bereits befreundet.");
      }

      const friendShip = friendModel(currentUser.id, targetFriend.id);
      db.prepare('INSERT INTO Friendships (sender_id, receiver_id, status) VALUES (?, ?, ?)').run(friendShip.sender_id, friendShip.receiver_id, friendShip.status);
      return "done"
        
    }catch (err) {
        console.error("Fehler beim Senden der Freundschaftsanfrage:", err.message);
        throw err;
    }}
/**
 * Akzeptiert oder lehnt eine Freundschaftsanfrage ab.
 */
export async function answerRequest(db, currentUser, targetUser, answer) {
    try {
        const target = await getUserByUsername(db, targetUser);
        if (!target) {
            console.error(`Benutzer ${targetUser} nicht gefunden.`);
            throw new Error(`Benutzer ${targetUser} nicht gefunden.`);
        }
        console.log("User gefunden:", target);

        let changes = 0; // Speichert, ob die Query Änderungen vorgenommen hat

        if (answer === answerRequestEnum.accept) {
            console.log(`Akzeptiere Freundschaftsanfrage von ${target.username}`);

            const updateResult = db.prepare(`
                UPDATE Friendships 
                SET status = 'ACCEPTED'
                WHERE sender_id = ? AND receiver_id = ? AND status = 'PENDING'
            `).run(target.id, currentUser.id);

            changes = updateResult.changes;
        } else {
            console.log(`Lehne Freundschaftsanfrage von ${target.username} ab`);

            const deleteResult = db.prepare(`
                DELETE FROM Friendships
                WHERE sender_id = ? AND receiver_id = ? AND status = 'PENDING'
            `).run(target.id, currentUser.id);

            changes = deleteResult.changes;
        }

        if (changes === 0) {
            console.warn("Keine Freundschaftsanfrage gefunden oder bereits beantwortet.");
            throw new Error("Keine ausstehende Freundschaftsanfrage gefunden oder bereits beantwortet.");
        } else {
            console.log(`Erfolgreich verarbeitet, ${changes} Zeile(n) geändert.`);
        }

    } catch (err) {
        console.error("Fehler:", err.message);
        throw err;

    }
}




export async function searchFriendsOfUser(db, userId) {
    const query = `
        SELECT u.id, u.username, u.email
        FROM Users u
        WHERE u.id IN (
            SELECT f.receiver_id
            FROM Friendships f
            WHERE f.sender_id = ? AND f.status = 'ACCEPTED'
            UNION
            SELECT f.sender_id
            FROM Friendships f
            WHERE f.receiver_id = ? AND f.status = 'ACCEPTED'
        )
    `;
    return db.prepare(query).all(userId, userId);
}


export async function findAllFriendRequests(db, userId) {
    console.log(userId)
    const query = `
        SELECT u.id, u.username, u.email
        FROM Users u
        WHERE u.id IN (
            SELECT f.sender_id
            FROM Friendships f
            WHERE f.receiver_id = ? AND f.status = 'PENDING'
        )
    `;
    const result = db.prepare(query).all(userId);
    console.log(result);
    return result;
}


