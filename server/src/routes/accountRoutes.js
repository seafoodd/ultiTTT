import express from "express";
import { updateProfile } from "../controllers/accountController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch("/profile", authenticateToken, updateProfile);

export default router;
