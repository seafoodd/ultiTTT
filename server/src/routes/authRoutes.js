import express from "express";
import {register, login, verifyToken, guestLogin, confirmEmail} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/confirm-email", confirmEmail);
router.post("/guestLogin", guestLogin);
router.get("/verifyToken", authenticateToken, verifyToken);

export default router;
