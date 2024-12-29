import express from "express";
import {sendFriendRequest, getFriends, removeFriend} from "../controllers/friendController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add/:username", authenticateToken, sendFriendRequest);
router.post("/remove/:username", authenticateToken, removeFriend);
// router.post("/accept/:id", authenticateToken, acceptRequest);
router.get("", authenticateToken, getFriends);


export default router;
