export const userSchema = {
  $id: "userSchema",
  type: "object",
  properties: {
      id: { type: "string" }, 
      username: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
      profile_picture: { type: "string", nullable: true }  
  },
  required: ["username", "email", "password"]
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
