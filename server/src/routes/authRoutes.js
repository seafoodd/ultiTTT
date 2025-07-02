import express from "express";
import {
  register,
  login,
  guestLogin,
  confirmEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/confirm-email", confirmEmail);
router.post("/guestLogin", guestLogin);

export default router;
