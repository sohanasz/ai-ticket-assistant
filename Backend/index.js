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
import Chat from "./models/chat.js";
import Ticket from "./models/ticket.js";

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

  // Explicit disconnection handling like reloading or network glitch
  socket.on("disconnect", () => {
    if (userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
    }
  });

  socket.on("retrieve-ticket-specific-messages", async ({ ticket }) => {
    const chats = await Chat.find({
      ticketId: new mongoose.Types.ObjectId(ticket._id),
    }).sort({ createdAt: 1 });

    // const enabledChat = await Ticket.findById(ticket._id).select("enableChat");
    const enabledChat = ticket.enableChat;
    socket.emit("receive-messages-from-server", { chats, enabledChat, ticket });
  });

  socket.on(
    "send-message-to-user",
    async ({ message, toUserId, fromUserId, ticket }) => {
      await Chat.insertOne({
        ticketId: ticket,
        message: message,
        sender: fromUserId,
        receiver: toUserId,
      });
    }
  );
});

const changeStream = Chat.watch();
changeStream.on("change", (change) => {
  if (change.operationType === "insert") {
    const document = change.fullDocument;
    const chatsReceiverSocketId = userSocketMap.get(
      document.receiver.toString()
    );
    console.log("DEBUG CHANGE STREAM", chatsReceiverSocketId, document);

    if (chatsReceiverSocketId) {
      io.to(chatsReceiverSocketId).emit("retrieve-ticket-specific-messages", [
        document,
      ]);
      console.log(`Message sent via WS to ${document.receiverId}`);
    } else {
      console.log(`${document.receiver} user is offline`);
    }
  }
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
