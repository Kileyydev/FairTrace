import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("sock connected", socket.id);

  // join a room for product updates (e.g., pid)
  socket.on("subscribe", (room) => {
    socket.join(room);
  });

  socket.on("unsubscribe", room => socket.leave(room));

  // driver client can emit location updates:
  socket.on("location_update", (payload) => {
    // payload: { pid, lat, lng }
    if (!payload || !payload.pid) return;
    const room = `product_${payload.pid}`;
    // broadcast to farmer clients viewing that product
    io.to(room).emit("location_update", payload);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => console.log("Socket server listening", PORT));
