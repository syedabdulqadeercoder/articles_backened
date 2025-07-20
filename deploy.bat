@echo off
echo Building and deploying to Vercel...

REM Ensure environment variables are set
echo Checking for .env file...
if not exist .env (
  echo Creating .env file...
  echo MONGODB_URI=mongodb+srv://abdulqadeersolutions:fGuzJaVsXmhV0RCV@cluster0.m0nrqlp.mongodb.net/?retryWrites=true^&w=majority > .env
  echo MONGODB_DB=articles_db >> .env
)

REM Run Vercel deployment
echo Running deployment...
call npx vercel deploy --prod

echo Deployment complete!
