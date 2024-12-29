import express from "express";
import {
  getByUsername,
  getGameHistory,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:username", getByUsername);
router.get("/:username/games", getGameHistory);

export default router;
