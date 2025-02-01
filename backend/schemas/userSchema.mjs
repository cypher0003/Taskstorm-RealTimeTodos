export const userSchema = {
    $id: "userSchema",
    type: "object",
    properties: {
      id: { type: "string" }, 
      username: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" }, 
    },
    required: ["username", "email", "password"],
  };
  
  export const createUserOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["username", "email", "password"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            user: { $ref: "userSchema#" },
          },
        },
      },
    },
  };