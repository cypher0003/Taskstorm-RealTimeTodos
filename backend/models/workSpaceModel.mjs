import { v4 } from "uuid"

export function workSpaceModel(name, admin_id) {
    return{
        id: v4(),
        name,
        admin_id,
    }
}

export function workSpaceToUserModel(workspace_id, user_id) {
    return {
        id: v4(),
        workspace_id,
        user_id
    }
}