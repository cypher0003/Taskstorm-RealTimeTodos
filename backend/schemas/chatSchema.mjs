export const messageSchema = {
    $id: "messageSchema",
    type: "object",
    properties: {
        id: { type: "string", format: "uuid" },
        sender_id: { type: "string" },
        receiver_id: { type: "string" },
        message: { type: "string", minLength: 1 }, 
        created_at: { type: "string", format: "date-time" }  
    },
    required: ["id", "sender_id", "receiver_id", "message", "created_at"]
};

export const sendMessageOptions = {
    schema: {
        body: {
            type: "object",
            properties: {
                receiver_id: { type: "string" },
                message: { type: "string", minLength: 1 }
            },
            required: ["receiver_id", "message"]
        },
        response: {
            201: {
                type: "object",
                properties: {
                    message: { $ref: "messageSchema#" }
                }
            }
        }
    }
};

export const getMessagesOptions = {
    schema: {
        params: {
            type: "object",
            properties: {
                userA: { type: "string" },
                userB: { type: "string" }
            },
            required: ["userA", "userB"]
        },
        response: {
            200: {
                type: "object",
                properties: {
                    messages: {
                        type: "array",
                        items: { $ref: "messageSchema#" }
                    }
                }
            }
        }
    }
};
