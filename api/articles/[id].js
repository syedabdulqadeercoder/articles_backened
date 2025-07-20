// api/articles/[id].js
// Get article by ID or formatted title

const { connectToDatabase } = require('../../lib/mongodb');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the ID from the URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Article ID is required' });
    }
    
    // Connect to the database
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
    
    // If no article found, return 404
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return the article
    return res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch article', 
      details: error.message 
    });
  }
}
