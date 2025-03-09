import { getUserByUsername } from "./userLogik.mjs";
import { answerRequestEnum } from "../enums/answerRequest.mjs";
import { friendModel } from "../models/friendModel.mjs";

export async function sendFriendRequest(db, currentUser, targetUser) {
    try {
        if (currentUser.username === targetUser) {
            throw new Error("Du kannst dich nicht selbst hinzufügen.");
        }

        const targetFriend = await getUserByUsername(db, targetUser);
        console.log(`📌 Sende Freundschaftsanfrage an ${targetFriend.username}`);

        const checkStmt = db.prepare(`
            SELECT * FROM Friendships
            WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
        `);
        const existingRequest = checkStmt.get(currentUser.id, targetFriend.id);
        
        if (existingRequest) throw new Error(" Anfrage bereits gesendet.");

        const request = friendModel(currentUser.id, targetFriend.id);
        db.prepare(`
            INSERT INTO Friendships (id, sender_id, receiver_id, status) 
            VALUES (?, ?, ?, ?)
        `).run(request.id, request.sender_id, request.receiver_id, request.status);

        console.log("✅ Freundschaftsanfrage erfolgreich gesendet.");
        return request;
    } catch (err) {
        console.error("Fehler:", err.message);
        throw err;
    }
}

/**
 * Akzeptiert oder lehnt eine Freundschaftsanfrage ab.
 */
export async function answerRequest(db, currentUser, targetUser, answer) {
    try {
        const target = await getUserByUsername(db, targetUser);

        if (answer === answerRequestEnum.accept) {
            console.log(`Akzeptiere Freundschaftsanfrage von ${target.username}`);
            db.prepare(`
                UPDATE Friendships 
                SET status = 'accepted'
                WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
            `).run(target.id, currentUser.id);
        } else {
            console.log(`Lehne Freundschaftsanfrage von ${target.username} ab`);
            db.prepare(`
                DELETE FROM Friendships
                WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
            `).run(target.id, currentUser.id);
        }
    } catch (err) {
        console.error(" Fehler:", err.message);
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
