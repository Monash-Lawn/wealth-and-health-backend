import { Collection, ObjectId, VectorDoc } from "@datastax/astra-db-ts";
import { getDb } from "../lib/db.ts";

const db = getDb();

export const COLLECTION_NAME = 'analytics';

export interface Analytics extends VectorDoc {
    location: ObjectId;
    category: number;
    average: number;
    numberOfSpendings: number;
}

let collection: Collection<Analytics> | null = null;

(async function () {
    collection = await db.createCollection('analytics', {
        indexing: {
            allow: ['location', 'category']
        },
        defaultId: {
            type: 'objectId',
        }
    });
})();

export default collection;