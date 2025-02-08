import { v4 } from "uuid";
import { todoStatusEnum } from "../enums/todoStatus.mjs";

export function todoModel(workspace_id, creator_id, todo)
{
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

    return{
        id:v4(),
        workspace_id,
        creator_id,
        todo,
        todoStatus: todoStatusEnum.pending,
        timestamp,
    }
}