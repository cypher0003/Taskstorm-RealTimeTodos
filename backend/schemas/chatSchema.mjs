export const messageSchema = {
    $id: "messageSchema",
    type: "object",
    properties: {
        id: { type: "string", format: "uuid" },
        sender_id: { type: "string" },
        receiver_id: { type: "string" },
        todo: { type: "string", minLength: 1 },
        todoStatus: { type: "string" },
    },
    
};

export const sendMessageOptions = {
    schema: {
        body: {
            type: "object",
            properties: {
                receiver_id: { type: "string" },
                todo: { type: "string", minLength: 1 }
            },
            
        },
        response: {
            201: {
                type: "object",
                properties: {
                    todo: { $ref: "messageSchema#" }
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
