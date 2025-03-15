import { SomeDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

const db = getDb();

export const COLLECTION_NAME = 'locations';

export interface Location extends SomeDoc {
    name: string;
    lat: number;
    long: number;
}
