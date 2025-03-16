import { COLLECTION_NAME as SPENDING_COLLECTION_NAME } from "../models/spending.model.ts";
import { COLLECTION_NAME as ANALYTICS_COLLECTION_NAME } from "../models/spending.model.ts";
import { getDb } from "../lib/db.ts";
import { estimateSpending, formatAnalyticsAdvice, formatEstimate, getAnalyticsAdvice } from "../lib/ai.ts";

const db = getDb();
const Spending = db.collection(SPENDING_COLLECTION_NAME);
const Analytics = db.collection(ANALYTICS_COLLECTION_NAME);

export const getMonthlyEstimate = async (req: any, res: any, next: any) => {
    const user = req.user;

    const userSpendings = await Spending.find({ user: user._id }).toArray();

    if (userSpendings.length === 0) {
        return res.status(200).json({ success: false, error: false, message: "Not enough data to generate a monthly estimate." });
    }

    const result = await estimateSpending(userSpendings.map(s => ({ category: s.category, price: s.price, date: s.date })));

    const text = formatEstimate(result);

    res.status(200).json({ success: true, error: false, message: text });
}


export const getAnalytics = async (req: any, res: any, next: any) => {
    const user = req.user;

    const userSpendings = await Spending.find({ user: user._id }).toArray();

    if (userSpendings.length === 0) {
        return res.status(200).json({ success: false, error: false, message: "No spendings found." });
    }

    const analytics = await Analytics.find({}).toArray();

    const result = await getAnalyticsAdvice(userSpendings, analytics);

    const text = formatAnalyticsAdvice(result);

    res.status(200).json({ success: true, error: false, message: text });
}