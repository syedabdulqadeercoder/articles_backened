// api/debug-db.js
// Debugging API to check MongoDB connection and data

const { connectToDatabase } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  try {
    // Connect to the database
    const { client, db } = await connectToDatabase();
    
    // Get environment variables and connection info
    const dbName = process.env.MONGODB_DB || 'articles_db';
    const mongoUri = process.env.MONGODB_URI || 'Not set';
    const mongoUriMasked = mongoUri.replace(/:([^:@]+)@/, ':***@'); // Mask password for security
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get article count and sample
    const articleCollection = db.collection('articles');
    const count = await articleCollection.countDocuments();
    
    // Get a sample article (first one)
    const sampleArticle = count > 0 
      ? await articleCollection.findOne({})
      : null;
    
    // Get connection info
    const dbInfo = {
      databaseName: db.databaseName,
      environment: process.env.NODE_ENV || 'Not set',
      mongoUriMasked,
      collections: collectionNames,
      articlesCount: count,
      sampleArticle: sampleArticle ? {
        _id: sampleArticle._id.toString(),
        title: sampleArticle.title || 'No title',
        formattedTitle: sampleArticle.formattedTitle || 'No formatted title',
        // Include other sample fields but limit the response size
        fields: Object.keys(sampleArticle)
      } : 'No articles found'
    };
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).json(dbInfo);
  } catch (error) {
    console.error('Error in debug-db endpoint:', error);
    return res.status(500).json({ 
      error: 'Database connection error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
