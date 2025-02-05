import { v4 } from "uuid";
import { todoStatusEnum } from "../enums/todoStatus.mjs";

export function todoModel(sender_id, receiver_id, todo)
{
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

    return{
        id:v4(),
        sender_id,
        receiver_id, 
        todo,
        todoStatus: todoStatusEnum.pending,
        timestamp,
    }
}