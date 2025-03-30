import { userModel } from "../models/userModel.mjs";
import {  getCachedUserProfile, cacheUserProfile} from "../database/redis.mjs";

/**
 * Erstellt einen neuen Benutzer und speichert ihn in der Datenbank.
 * Das Benutzerprofil wird für schnellen Zugriff in Redis gecacht.
 */
export async function createUser(db, username, email, password, profile_picture) {
    console.log(`Erstelle Benutzer: ${username}, Email: ${email}`);

    const user = userModel(username, password, email, profile_picture);
    
    db.prepare(`
        INSERT INTO Users(id, username, email, password, profile_picture) 
        VALUES (?, ?, ?, ?, ?)
    `).run(user.id, user.username, user.email, user.password, user.profile_picture);

    console.log("Benutzer erfolgreich gespeichert.");
    
    await cacheUserProfile(user);
    
    return user;
}

/**
 * Holt einen Benutzer anhand seiner E-Mail-Adresse aus der Datenbank oder dem Cache.
 */
export async function getUserByEmail(db, email) {
    const cachedUser = await getCachedUserProfile(email);
    if (cachedUser) {
        console.log(`Benutzer aus Cache geladen: ${cachedUser.username}`);
        return cachedUser;
    }

    console.log(`Suche Benutzer in der Datenbank: ${email}`);
    const foundUser = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);
    
    if (!foundUser) throw new Error("Benutzer nicht gefunden.");

    await cacheUserProfile(foundUser);
    return foundUser;
}

/**
 * Holt einen Benutzer anhand seines Benutzernamens.
 */
export async function getUserByUsername(db, username) {
    console.log(`Suche Benutzer: ${username}`);

    const user = db.prepare(`
        SELECT * FROM Users 
        WHERE username = ?
    `).get(username);

    if (!user) throw new Error("Benutzer nicht gefunden.");
    
    return user;
}

