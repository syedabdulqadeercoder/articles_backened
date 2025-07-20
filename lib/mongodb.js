// lib/mongodb.js
// Optimized MongoDB connection for serverless environments

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'articles_db';

// Check the MongoDB URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Connection caching for serverless environments
let cachedClient = null;
let cachedDb = null;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let globalWithMongo = global;
if (!globalWithMongo._mongoClientPromise) {
  globalWithMongo._mongoClientPromise = null;
}

async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If we have a cached connection in global, use it (for development)
  if (globalWithMongo._mongoClientPromise) {
    const client = await globalWithMongo._mongoClientPromise;
    const db = client.db(MONGODB_DB);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  }

  // Create a new connection
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 1, // Minimize connections for serverless
    serverSelectionTimeoutMS: 5000, // Fail fast on connection issues
    socketTimeoutMS: 30000 // But allow operations some time
  });

  // Store the promise in development to prevent multiple connections
  if (process.env.NODE_ENV !== 'production') {
    globalWithMongo._mongoClientPromise = client.connect();
    const connectedClient = await globalWithMongo._mongoClientPromise;
    const db = connectedClient.db(MONGODB_DB);
    cachedClient = connectedClient;
    cachedDb = db;
    return { client: connectedClient, db };
  } else {
    // In production just connect normally but cache the connection
    await client.connect();
    const db = client.db(MONGODB_DB);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  }
}

module.exports = { connectToDatabase };
