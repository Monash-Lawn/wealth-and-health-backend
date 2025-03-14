import { Collection, SomeDoc } from '@datastax/astra-db-ts';
import { getDb } from '../lib/db.ts';

export const COLLECTION_NAME = 'users';

// Get a new Db instance
const db = getDb();

export enum UserSize {
    SOLO = 'solo',
    FAMILY = 'family',
}

// Define the schema for the collection
interface User extends SomeDoc {
  username: string,
  password: string,
  size: UserSize
}

let collection: Collection<User> | null = null;

(async function () {
  collection = await db.createCollection(COLLECTION_NAME);
})();

export default collection;