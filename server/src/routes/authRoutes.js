import express from "express";
import { register, login, verifyToken } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verifyToken", authenticateToken, verifyToken);

export default router;
