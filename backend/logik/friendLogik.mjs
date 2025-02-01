import { getUserByUsername } from "./userLogik.mjs";
import { answerRequestEnum } from "../enums/answerRequest.mjs";
import { friendModel } from "../models/friendModel.mjs";


export async function sendFriendRequest(db, currentUser, targetUser) {
    try{
        if(currentUser.username === targetUser)
        {
            throw new Error("You can`t add yourself")
        }

        console.log("From logik: ", targetUser)
        const targetFriend = await getUserByUsername(db, targetUser)

        const checkIfRquestSendedStmt = db.prepare(`
            SELECT * FROM Friendships
            WHERE sender_id = ?
            AND receiver_id = ?
          `);
          const existing = checkIfRquestSendedStmt.get(currentUser.id, targetFriend.id);
      
          if (existing) {
            throw new Error("Friend request already sent to this user!");
          }


          const checkIfAlreadyReceivedRequestStmt = db.prepare(`SELECT * FROM Friendships
      WHERE
        (
          (sender_id = ? AND receiver_id = ?)
          OR
          (sender_id = ? AND receiver_id = ?)
        )
        AND status = 'PENDING'`)

        const exists = checkIfAlreadyReceivedRequestStmt.get(currentUser.id, targetFriend.id, targetFriend.id, currentUser.id)

        if (exists)
        {
            throw new Error("there is already a pending request between both of you")
        }
        console.log("target: ", targetFriend)
        const request = friendModel(currentUser.id,targetFriend.id)
        db.prepare(`INSERT INTO Friendships(id, sender_id, receiver_id, status) VALUES (?, ?, ?, ?)`).run(request.id, request.sender_id, request.receiver_id, request.status)
        console.log("Friend request successfully inserted")
        return request
    }catch(err)
    {
        
        console.log("Error: ", err.message);
        throw err
    }
}

export async function answerRequest(db, currentUser,targetUser, answer) {
    
    try
    {
        console.log("answer: ",answer)
        const target = await getUserByUsername(db, targetUser)
        if(answer === answerRequestEnum.accept){
        console.log("==accept=branch==")
        console.log("target_id: ", target.id, " currentUser: ", currentUser.id)
        const result =db.prepare(`
            UPDATE Friendships 
            SET status = 'ACCEPTED'
            WHERE sender_id = ?
            AND receiver_id = ?
            AND status = 'PENDING'`).run(target.id, currentUser.id)

        return result
    
    
    }else if(answer === answerRequestEnum.deny)
    {
        console.log("==deny=branch==")
        const delResult = db.prepare(`
            DELETE FROM Friendships
            WHERE sender_id = ?
              AND receiver_id = ?
              AND status = 'PENDING'
          `).run(target.id, currentUser.id);

          return delResult;
    }
    }catch(err)
    {
        console.log("Error: ", err.message);
        throw err
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

 