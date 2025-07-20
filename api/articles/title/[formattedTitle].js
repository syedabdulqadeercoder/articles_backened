// api/articles/title/[formattedTitle].js
// Get article by formatted title

const { connectToDatabase } = require('../../../lib/mongodb');

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the formatted title from the URL
    const { formattedTitle } = req.query;
    
    if (!formattedTitle) {
      return res.status(400).json({ error: 'Formatted title is required' });
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the article by formatted title
    const article = await db.collection('articles').findOne({ formattedTitle });
    
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
    console.error('Error fetching article by formatted title:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch article', 
      details: error.message 
    });
  }
}
