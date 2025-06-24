import { MongoClient } from "mongodb";

// Native MongoDB connection utility. Used by next-auth and other APIs.

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getClient() {
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db();
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}
