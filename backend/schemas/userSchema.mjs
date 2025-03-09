export const userSchema = {
    $id: "userSchema",
    type: "object",
    properties: {
        id: { type: "string", format: "uuid" }, 
        username: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string" },
        profile_picture: { type: "string", nullable: true, default: "/default.png" },
        created_at: { type: "string", format: "date-time" }
    },
    required: ["id", "username", "email", "password", "created_at"]
};

export const createUserOptions = {
    schema: {
        consumes: ["multipart/form-data"], 
        body: {
            type: "object",
            properties: {
                username: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string" },
                profile_picture: { type: "string", nullable: true }
            },
            required: ["username", "email", "password"]
        },
        response: {
            201: {
                type: "object",
                properties: {
                    user: { $ref: "userSchema#" }
                }
            }
        }
    }
};
