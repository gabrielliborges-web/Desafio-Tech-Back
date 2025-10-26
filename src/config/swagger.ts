import { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export function setupSwagger(app: Application) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Desafio Movie API",
        version: "1.0.0",
        description: "Documentação da API do Desafio Movie",
      },
      servers: [{ url: "http://localhost:4000" }],
    },
    apis: ["./src/docs/*.ts"],
  };

  const specs = swaggerJsdoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}
