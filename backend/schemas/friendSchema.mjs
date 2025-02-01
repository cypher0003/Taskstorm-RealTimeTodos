export const friendSchema = {
    $id: "friendSchema",
    type: "object",
    properties: {
      id: { type: "string" }, 
      sender_id: { type: "string" },
      receiver_id: { type: "string"},
      status: { type: "string" }, 
    },
    
  };
  
  export const sendFriendRequestOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
        },
        required: ["username"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            friend: { $ref: "friendSchema#" },
          },
        },
      },
    },
  };

  export const answerFriendRequestOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
          answer: { type: "string" },
        },
        required: ["username"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            friend: { $ref: "friendSchema#" },
          },
        },
      },
    },
  };

  export const searchFriendsOfUserOptions = {
    schema: {
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
              email: { type: "string" },
            },
            required: ["id", "username", "email"],
          },
        },
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
        500: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
      },
    },
  };
  
  