// api/articles/category/[category].js
// Get articles by category

const { connectToDatabase } = require('../../../lib/mongodb');

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the category from the URL
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Get articles with pagination
    const articles = await db
      .collection('articles')
      .find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return the articles
    return res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch articles by category', 
      details: error.message 
    });
  }
}
