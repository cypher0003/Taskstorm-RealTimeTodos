export const friendSchema = {
  $id: "friendSchema",
  type: "object",
  properties: {
      id: { type: "string", format: "uuid" },
      sender_id: { type: "string" },
      receiver_id: { type: "string" },
      status: { type: "string", enum: ["pending", "accepted", "rejected"] },
      created_at: { type: "string", format: "date-time" }
  },

};

export const sendFriendRequestOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" }
        },
        required: ["username"]
      },
      response: {
        201: {
          type: "object",
          properties: {
            username: { type: "string" },
            friend: { type: "string" }
          },
         
        }
      }
    }
  }

  export const answerFriendRequestOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          answer: { type: "string" }
        },
      },
      response: {
        201: {
          type: "object",
          properties: {
            friend: { $ref: "friendSchema#" }
          }
        }
      }
    }
  };
  


export const searchFriendsOfUserOptions = {
  schema: {
      response: {
          200: {
              type: "array",
              items: {
                  type: "object",
                  properties: {
                      id: { type: "string", format: "uuid" },
                      username: { type: "string" },
                      email: { type: "string", format: "email" }
                  },
                  required: ["id", "username", "email"]
              }
          }
      }
  }
};
