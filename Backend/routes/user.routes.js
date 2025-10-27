import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlwares/auth.js";
const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
