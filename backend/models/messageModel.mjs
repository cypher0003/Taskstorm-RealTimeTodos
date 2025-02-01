import { v4 } from "uuid";

export function messageModel(sender_id, receiver_id, message)
{
    return{
        id:v4(),
        sender_id,
        receiver_id, 
        message,
        timestamp: Date.now(),
    }
}