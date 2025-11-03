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
  const userId = socket.handshake.query.userID;

  // Mapping Socket Id with UserID from DB
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, socket.id);
  } else {
    // Disconnect previous socket if exists
    const prevSocketId = userSocketMap.get(userId);
    const prevSocket = io.sockets.sockets.get(prevSocketId);
    if (prevSocket) prevSocket.disconnect(true);

    userSocketMap.set(userId, socket.id);
  }

  // Explicit disconnection handling
  socket.on("disconnect", () => {
    if (userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
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
