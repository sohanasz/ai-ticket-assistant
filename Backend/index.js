import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/tickets.routes.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/onSignUp.js";
import { onTicketCreated } from "./inngest/functions/onTicketCreation.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
const newServer = createServer(app);
const io = new Server(newServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("New connection happened", socket.id);

  const userId = socket.handshake.query.userID;

  // Mapping Socket Id with UserID from DB
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = socket.id;
  } else if (userSocketMap[userId]) {
    const socketId = userSocketMap[userId];
    const prevSocket = io.sockets.sockets.get(socketId);
    console.log("REMAPPING SOCKET", socketId, "NEW ID", socket.id);
    prevSocket.disconnect(true);
    userSocketMap[socket.handshake.query.userID] = socket.id;
  }

  console.log(userSocketMap, "ID ", socket.handshake.query.userID);

  // Explict Disconnection Handling From User side or from network err
  socket.on("disconnect", () => {
    console.log("DISCONN SOCKET", userSocketMap, userSocketMap[userId], userId);
    if (userSocketMap[userId] === socket.id) {
      userSocketMap[userId] = null;
    }
  });

  socket.on("connectedUserMessage", ({ message }) => {
    console.log("New Message", message);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    newServer.listen(PORT, () =>
      console.log("🚀 Server at http://localhost:3000")
    );
  })
  .catch((err) => console.error("❌ MongoDB error: ", err));
