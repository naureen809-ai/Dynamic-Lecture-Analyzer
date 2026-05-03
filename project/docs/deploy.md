# Deployment Guide — Free Hosting (Vercel frontend, Render backend, MongoDB Atlas)

Overview:
- Frontend: React + Vite + Tailwind (deploy to Vercel)
- Backend: Node.js + Express (deploy to Render)
- Database: MongoDB Atlas (free tier)

Steps (summary):
1. Push the `project` folder to a GitHub repository.
2. Create a MongoDB Atlas free cluster and get the `MONGODB_URI` connection string.
3. Deploy backend to Render:
   - Connect the GitHub repo, select `project/backend` as the service, set build command `npm install` and start command `npm start`.
   - Set environment variables on Render: `MONGODB_URI`, `OPENAI_API_KEY` (optional), `CLIENT_ORIGIN` (your Vercel URL or `*` for testing).
4. Deploy frontend to Vercel:
   - Connect the GitHub repo, select `project/frontend-react` as the root. Set `VITE_BACKEND_URL` in Vercel env to the Render backend URL.

Detailed commands (local):

Create GitHub repo and push:
```bash
git init
git add project
git commit -m "Initial project"
gh repo create my-dla --public --source=.
git push --set-upstream origin main
```

MongoDB Atlas:
- Sign up at https://www.mongodb.com/cloud/atlas and create a free cluster.
- Create a database user and allow your IP or 0.0.0.0/0 for testing.
- Get the connection string and set it as `MONGODB_URI` on Render.

Render backend settings:
- Build command: `npm install`
- Start command: `npm start`
- Root: `project/backend`
- Add env vars: `MONGODB_URI`, `OPENAI_API_KEY` (optional), `CLIENT_ORIGIN` (set your Vercel URL)

Vercel frontend settings:
- Root: `project/frontend-react`
- Build command: `npm run build`
- Output directory: `dist`
- Add env var: `VITE_BACKEND_URL` pointing to your Render service URL (e.g., `https://your-backend.onrender.com`)

Notes:
- If you want to keep the Streamlit app, use Streamlit Cloud or Render for that instead — Vercel is suited for React/Next/static frontends.
- For production OpenAI usage, add `OPENAI_API_KEY` in Render env.
