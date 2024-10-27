import express from "express";
import { signup, login, verifyToken } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verifyToken", authenticateToken, verifyToken);

export default router;
