import { Collection, ObjectId, SomeDoc } from "@datastax/astra-db-ts";
import { getDb } from "../lib/db.ts";

const db = getDb();

interface Analytics extends SomeDoc {
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
        }
    });
})();

export default collection;