// libs/mongodb.ts
import { MongoClient } from "mongodb";

const options = {}; // Keep it empty, dbName is elsewhere specified

let clientPromise: Promise<MongoClient> | undefined;

export default function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGO_URL"');
  }

  // Next.js also imports auth routes during builds; connect only on demand.
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();

      globalWithMongo._mongoClientPromise.then(() => {
        console.log("✅ MongoDB client connected (NextAuth)");
      }).catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
      });
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}
