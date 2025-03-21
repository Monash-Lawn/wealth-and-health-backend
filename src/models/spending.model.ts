import { ObjectId, VectorDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

const db = getDb();

export const COLLECTION_NAME = 'spendings';

export interface Spending extends VectorDoc {
    price: number;
    category: number;
    date: Date;
    location: ObjectId;
    remark: string;
    user: ObjectId;
}
