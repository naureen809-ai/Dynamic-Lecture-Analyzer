# Deployment Notes

## Recommended Production Flow

- Backend: Render or Railway
- Frontend: Streamlit Community Cloud or Render
- Database: MongoDB Atlas

## Backend Environment Variables

Set these on your hosting provider:

- `PORT`
- `MONGODB_URI`
- `CLIENT_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Backend Hosting Steps

1. Push the repo to GitHub.
2. Create a new Web Service on Render or Railway.
3. Point it to the `backend` folder.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add the environment variables above.

## Frontend Hosting Steps

1. Push the repo to GitHub.
2. Deploy on Vercel as a React/Vite app.
3. Set `VITE_BACKEND_URL` to the backend URL.
4. Build command: handled by `vercel.json`

## Vercel Notes

- Vercel is now the correct host for the React frontend.
- The old Streamlit frontend is no longer part of this deployment.
