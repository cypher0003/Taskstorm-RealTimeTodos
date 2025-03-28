import { v4 } from "uuid"

export function workSpaceModel(name, admin_id) {
    return{
        id: v4(),
        name,
        admin_id,
        created_at: new Date().toISOString()
    }
}

export function workSpaceToUserModel(workspace_id, user_id, role) {
    return {
        id: v4(),
        workspace_id,
        user_id,
        role,
        joined_at: new Date().toISOString()
    }
}