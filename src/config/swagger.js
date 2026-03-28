import swaggerJSDoc from "swagger-jsdoc";
import path from 'path'

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API",
      version: "1.0.0",
      description: "Backend API documentation",
    },
    servers: [
      {
        url: "https://authforge-vkjh.onrender.com",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  apis: [path.resolve("src/routes/**/*.js")],
};

export const swaggerSpec = swaggerJSDoc(options);
