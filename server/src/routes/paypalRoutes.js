import express from "express";
import {handlePayPalDonation} from "../controllers/paypalControllers.js";
const router = express.Router();

router.post("/:username", handlePayPalDonation);

export default router;
