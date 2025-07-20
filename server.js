const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI - direct connection with fewer options
const uri = "mongodb+srv://abdulqadeersolutions:fGuzJaVsXmhV0RCV@cluster0.m0nrqlp.mongodb.net/?retryWrites=true&w=majority";

// Global MongoDB client variable - following singleton pattern
let cachedClient = null;
let cachedDb = null;

// Simplified connection function for serverless environment
async function connectToDatabase() {
  // If we already have a connection, return the cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoDB client - simplified options
  const client = new MongoClient(uri, {
    maxPoolSize: 1, // Minimal pooling for serverless
    serverSelectionTimeoutMS: 5000, // Shorter timeout to fail fast
    socketTimeoutMS: 30000 // Longer socket timeout for operations
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    
    // Get the database
    const db = client.db();
    
    // Set cache variables
    cachedClient = client;
    cachedDb = db;
    
    console.log("Connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// API Routes

// 1. Get all articles with simplified error handling
app.get('/api/articles', async (req, res) => {
  try {
    // Get database connection
    const { db } = await connectToDatabase();
    
    // Simple query with default timeout
    const articles = await db.collection('articles')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent large result sets
      .toArray();
    
    return res.json(articles);
  } catch (error) {
    console.error(`Error fetching articles: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to fetch articles', 
      details: error.message 
    });
  }
});

// 2. Get articles by category - simplified
app.get('/api/articles/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // Get database connection
    const { db } = await connectToDatabase();
    
    // Simple query with category filter
    const articles = await db.collection('articles')
      .find({ category })
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent large result sets
      .toArray();
    
    return res.json(articles);
  } catch (error) {
    console.error(`Error fetching articles by category: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to fetch articles by category', 
      details: error.message 
    });
  }
});

// 3. Get article by formatted title - simplified
app.get('/api/articles/title/:formattedTitle', async (req, res) => {
  try {
    const { formattedTitle } = req.params;
    
    // Get database connection
    const { db } = await connectToDatabase();
    
    // Simple findOne query
    const article = await db.collection('articles').findOne({ formattedTitle });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    return res.json(article);
  } catch (error) {
    console.error(`Error fetching article by title: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to fetch article', 
      details: error.message 
    });
  }
});

// 4. Get article by ID or formatted title - simplified
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get database connection
    const { db } = await connectToDatabase();
    
    let article;
    
    // Check if the ID is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isValidObjectId) {
      // If it's a valid ObjectId, try to find by ID
      article = await db.collection('articles').findOne({ _id: new ObjectId(id) });
    } 
    
    // If no article found or ID is not a valid ObjectId, try formatted title
    if (!article) {
      article = await db.collection('articles').findOne({ formattedTitle: id });
    }
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    return res.json(article);
  } catch (error) {
    console.error(`Error fetching article by ID: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to fetch article', 
      details: error.message 
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'AlwariDev Articles API',
    endpoints: [
      { 
        path: '/api/articles', 
        method: 'GET',
        description: 'Get all articles' 
      },
      { 
        path: '/api/articles/category/:category', 
        method: 'GET',
        description: 'Get articles by category',
        example: '/api/articles/category/Artificial Intelligence' 
      },
      { 
        path: '/api/articles/title/:formattedTitle', 
        method: 'GET',
        description: 'Get article by formatted title',
        example: '/api/articles/title/the-future-of-ai-development' 
      },
      { 
        path: '/api/articles/:id', 
        method: 'GET',
        description: 'Get article by ID or formatted title',
        example: '/api/articles/65ab1c2f3e4d5f6a7b8c9d0e' 
      }
    ]
  });
});

// For local development - start server directly
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  // Connect to MongoDB and start server
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      process.exit(1);
    });
} else {
  // For Vercel, just log that we're in production mode
  console.log('Running in production mode');
}

// For Vercel deployment
module.exports = app;