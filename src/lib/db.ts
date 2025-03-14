import { DataAPIClient, Db } from "@datastax/astra-db-ts";

import dotenv from "dotenv";
dotenv.config();

let db: Db;

/**
 * Connects to a DataStax Astra database.
 * This function retrieves the database endpoint and application token from the
 * environment variables `ASTRA_DB_API_ENDPOINT` and `ASTRA_DB_APPLICATION_TOKEN`.
 *
 * @returns An instance of the connected database.
 * @throws Will throw an error if the environment variables
 * `ASTRA_DB_API_ENDPOINT` or `ASTRA_DB_APPLICATION_TOKEN` are not defined.
 */
export function connectToDatabase() {
  const { ASTRA_DB_API_ENDPOINT: endpoint, ASTRA_DB_APPLICATION_TOKEN: token } = process.env; 

  if (!token || !endpoint) {
    throw new Error(
      "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined.",
    );
  }

  const client = new DataAPIClient(token);

  const database = client.db(endpoint);

  console.log(`Connected to database ${database.id}`);

  db = database;
}


export function getDb(): Db {
  if (!db) {
    connectToDatabase();
  }
  return db;
}