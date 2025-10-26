import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";
import moviesRoutes from "./routes/movie.routes";
import { setupSwagger } from "./config/swagger";

const app: Application = express();

setupSwagger(app);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use("/auth", authRoutes);
app.use("/movie", moviesRoutes);

app.get("/", (req, res) => {
  res.send("Desafio-movie-back ON");
});

export default app;
