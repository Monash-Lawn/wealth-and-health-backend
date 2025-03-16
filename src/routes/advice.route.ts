import express from "express";
import { getAnalytics, getMonthlyEstimate } from "../controllers/advice.controller.ts";

const router = express.Router();

router.get('/estimation', getMonthlyEstimate);
router.get('/spending', getAnalytics);

export default router;