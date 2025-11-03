import express from "express";
import { authenticate } from "../middlwares/auth.js";
import {
  createTicket,
  getTicket,
  getTickets,
  toggleTicketChat,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);
router.put("/:id", authenticate, toggleTicketChat);

export default router;
