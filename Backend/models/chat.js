import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);
