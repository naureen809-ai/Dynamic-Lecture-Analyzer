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

1. Push `project/backend` to GitHub.
2. Create a new Web Service on Render or Railway.
3. Point it to the backend folder.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add the environment variables above.

## Frontend Hosting Steps

1. Push `project/frontend` to GitHub.
2. Deploy on Streamlit Community Cloud or Render.
3. Set `BACKEND_URL` to the backend URL.
4. Start command: `streamlit run app.py`

## Vercel Limitation

Streamlit is a long-running Python app. Vercel is better for serverless or static apps, so a full Streamlit deployment is usually unstable there.

## If You Still Want Vercel

- Use Vercel for a static landing page only.
- Keep the Streamlit app on a Python-friendly host.
