import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FitHub API",
      version: "1.0.0",
      description: "API for FitHub fitness application",
      contact: {
        name: "FitHub Team",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User operations",
      },
      {
        name: "Gyms",
        description: "Gym facility operations",
      },
      {
        name: "Bookings",
        description: "Gym booking operations",
      },
      {
        name: "Workouts",
        description: "Workout tracking operations",
      },
      {
        name: "Posts",
        description: "Community forum operations",
      },
      {
        name: "AI",
        description: "AI-powered workout suggestions",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const specs = swaggerJsDoc(options);

export { specs, swaggerUi };
