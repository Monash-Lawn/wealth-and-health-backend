import { Collection, ObjectId, SomeDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

const db = getDb();

interface Spending extends SomeDoc {
    price: number;
    category: number;
    date: Date;
    location: ObjectId;
    remark: string;
    user: ObjectId;
}

let collection: Collection<Spending> | null = null;

(async function () {
    collection = await db.createCollection('spendings', {
        indexing: {
            allow: ['user']
        }
    });
})();

export default collection;