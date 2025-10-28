import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 4000;

const serverHttp = createServer(app);

const io = new Server(serverHttp, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🟢 Novo cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

serverHttp.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
