import { Collection, SomeDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

const db = getDb();

interface Location extends SomeDoc {
    name: string;
    lat: number;
    long: number;
}

let collection: Collection<Location> | null = null;

(async function () {
    collection = await db.createCollection('locations', {
        defaultId: {
            type: 'objectId'
        }
    });
})();

export default collection;