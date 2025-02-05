import { userModel } from "../models/userModel.mjs";
import { redisPublisher } from "../database/redis.mjs";


export async function createUser(db, username, email, password, profile_picture) {

    console.log("username: ", username);
    console.log("email: ", email);
    console.log("password: ", password);
    const user =  userModel(username, password, email, profile_picture);
    console.log("user created via model:" .user)
    db.prepare('INSERT INTO Users(id, username, email, password, profile_picture ) VALUES (?,?,?,?, ?)').run(user.id, user.username, user.email,user.password, user.profile_picture)
    console.log("database operation done")
    return user;
  }
  
  export async function getUserByEmail(db, email) {
    const foundUser = db
      .prepare("SELECT * FROM Users WHERE email = ?")
      .get(email);
  
    if (!foundUser) {
      throw new Error("No User was found");
    }
  
    return foundUser;
  }
  
  export async function getUserByUsername(db, username) {
  
    console.log("doing database interaction...")
    console.log("username: ", username)
    const stmt = db.prepare(
      `SELECT * FROM Users 
       WHERE username = ?`
    ).get(username);
  
    console.log("user found: ", stmt)
  
  
    return stmt; 
  }

  export async function setUserOnline(userId)
  {
    await redisPublisher.set(`user:${userId}:status`, "online", "EX", 600);
  }

  export async function setUserOffline(userId) {
    await redisPublisher.del(`user:${userId}:status`);
}