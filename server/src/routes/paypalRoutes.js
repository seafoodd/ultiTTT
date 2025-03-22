import express from "express";
import {handlePayPalDonation} from "../controllers/paypalControllers.js";
import {authenticateToken} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/:username", authenticateToken, handlePayPalDonation);

export default router;
