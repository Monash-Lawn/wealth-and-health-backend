import { Collection, SomeDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

const db = getDb();

export const COLLECTION_NAME = 'locations';

export interface Location extends SomeDoc {
    name: string;
    lat: number;
    long: number;
}

let collection: Collection<Location> | null = null;

(async function () {
    collection = await db.createCollection(COLLECTION_NAME);
})();

export default collection;