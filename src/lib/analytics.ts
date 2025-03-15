import { Analytics as AnalyticsSchema } from "../models/analytics.model.ts";
import { COLLECTION_NAME as ANALYTICS_COLLECTION_NAME } from '../models/analytics.model.ts';
import { getDb } from "./db.ts";
import { Location } from "../models/location.model.ts";
import { ObjectId } from "@datastax/astra-db-ts";

const db = getDb();
const Analytics = db.collection(ANALYTICS_COLLECTION_NAME);


export async function safeGetAnalytics(location: Location, category: number): Promise<AnalyticsSchema> {
    const analytic = await Analytics.findOne({ location: location._id, category });

    if (analytic) {
        return {
            _id: analytic._id,
            location: analytic.location,
            category: analytic.category,
            average: analytic.average,
            numberOfSpendings: analytic.numberOfSpendings
        };
    }

    const analyticId = (await Analytics.insertOne({ location: location._id, category, average: 0, numberOfSpendings: 0 })).insertedId;

    const newAnalytic = await Analytics.findOne({ _id: analyticId });

    if (!newAnalytic) {
        throw new Error('Failed to create analytics.');
    }

    return {
        _id: analyticId,
        location: newAnalytic.location,
        category: newAnalytic.category,
        average: newAnalytic.average,
        numberOfSpendings: newAnalytic.numberOfSpendings
    };
}