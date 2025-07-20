// api/index.js
// Root API endpoint

module.exports = function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Return API information
  res.status(200).json({
    message: 'AlwariDev Articles API',
    endpoints: [
      { 
        path: '/api/articles', 
        method: 'GET',
        description: 'Get all articles' 
      },
      { 
        path: '/api/articles/category/[category]', 
        method: 'GET',
        description: 'Get articles by category',
        example: '/api/articles/category/Artificial Intelligence' 
      },
      { 
        path: '/api/articles/title/[formattedTitle]', 
        method: 'GET',
        description: 'Get article by formatted title',
        example: '/api/articles/title/the-future-of-ai-development' 
      },
      { 
        path: '/api/articles/[id]', 
        method: 'GET',
        description: 'Get article by ID or formatted title',
        example: '/api/articles/65ab1c2f3e4d5f6a7b8c9d0e' 
      }
    ]
  });
}
