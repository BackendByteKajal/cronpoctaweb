import { MongoClient } from "mongodb";
let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB;
let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
let client;

let clientPromise;
let db;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local"
  );
}

export async function connectToDatabase() {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
      console.log("mongoclient created");
    }
    if (!clientPromise) clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  if (db) {
    console.log("db connection available...");
  }
  if (!db) {
    console.log("db connection created..");
    const conn = await clientPromise;
    db = conn.db(dbName);
  }
  return { clientPromise, db };
}
