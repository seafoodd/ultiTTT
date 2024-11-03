import express from "express";
import {
  getById,
  getByUsername,
  getGameHistory,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/username/:username", getByUsername);
router.get("/username/:username/games", getGameHistory);
router.get("/id/:id", getById);

export default router;
