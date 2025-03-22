import express from "express";
import {
  getByUsername,
  getGameHistory,
} from "../controllers/userController.js";
import {authenticateToken} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:username", authenticateToken, getByUsername);
router.get("/:username/games", getGameHistory);

export default router;
