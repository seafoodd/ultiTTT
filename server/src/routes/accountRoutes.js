import express from "express";
import { getAccount, updateProfile } from "../controllers/accountController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("", authenticateToken, getAccount);
router.patch("/profile", authenticateToken, updateProfile);

export default router;
