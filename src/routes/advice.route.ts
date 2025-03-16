import express from "express";
import { getAnalytics, getMonthlyEstimate } from "../controllers/advice.controller.ts";

const router = express.Router();

router.get('/monthly-estimate', getMonthlyEstimate);
router.get('/analytics', getAnalytics);

export default router;