import { v4 } from "uuid";
import { sha256 } from "js-sha256";

export function userModel(username, password, email, profile_picture = null) {
    return{
        id: v4(),
        username,
        email,
        password: sha256(password),
        profile_picture,
        created_at: new Date().toISOString()
    }
}