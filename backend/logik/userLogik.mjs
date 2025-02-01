import { userModel } from "../models/userModel.mjs";


export async function createUser(db, username, email, password) {

    console.log("username: ", username);
    console.log("email: ", email);
    console.log("password: ", password);
    const user =  userModel(username, password, email);
    console.log("user created via model:" .user)
    db.prepare('INSERT INTO Users(id, username, email, password ) VALUES (?,?,?,?)').run(user.id, user.username, user.email,user.password)
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