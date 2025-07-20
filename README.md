# DailyTechieFetch API

A serverless API for technology articles built with Node.js, MongoDB, and deployed on Vercel.

## Setup

1. Clone the repository
2. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=articles_db
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run locally:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/articles` - Get all articles
- `GET /api/articles/category/[category]` - Get articles by category
- `GET /api/articles/title/[formattedTitle]` - Get article by formatted title
- `GET /api/articles/[id]` - Get article by ID

## Deployment

To deploy to Vercel:

```
npm run deploy
```

Or run the included `deploy.bat` script on Windows.

## Troubleshooting

If you encounter MongoDB connection issues on Vercel:

1. Check that your MongoDB Atlas IP whitelist includes Vercel's IP ranges
2. Ensure your MongoDB Atlas cluster has SSL/TLS enabled
3. Try the debug endpoint `/api/debug-db` to get more information

## License

ISC
