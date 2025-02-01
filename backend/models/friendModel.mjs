import { v4 } from "uuid";
import { requestStatus } from "../enums/requestStatus.mjs";

export function friendModel (sender_id, receiver_id )
{
    return{
        id: v4(),
        sender_id,
        receiver_id,
        status: requestStatus.pending
    }
}