import express from "express";
import {getUserById, getUserByUsername, getUserGameHistory} from "../controllers/userController.js";

const router = express.Router();

router.get("/username/:username", getUserByUsername);
router.get("/username/:username/games", getUserGameHistory);
router.get("/id/:id", getUserById);

export default router;
