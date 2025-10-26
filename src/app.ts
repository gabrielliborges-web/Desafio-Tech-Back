import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application } from "express";

const app: Application = express();

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/", (req, res) => {
  res.send("Desafio-movie-back ON");
});

export default app;
