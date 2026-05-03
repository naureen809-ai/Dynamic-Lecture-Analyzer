# Deployment Guide - Free Hosting (Vercel frontend, Render backend, MongoDB Atlas)

Overview:
- Frontend: React + Vite + Tailwind (deploy to Vercel)
- Backend: Node.js + Express (deploy to Render)
- Database: MongoDB Atlas (free tier)

Steps:
1. Push the `project` folder to GitHub.
2. Create a free MongoDB Atlas cluster and copy the `MONGODB_URI`.
3. Deploy the backend to Render with `project/backend` as the service root.
4. Deploy the frontend to Vercel with `project` as the root so the root `vercel.json` is used.

Backend on Render:
- Build command: `npm install`
- Start command: `npm start`
- Env vars:
  - `MONGODB_URI`
  - `OPENAI_API_KEY` if you want real OpenAI responses
  - `OPENAI_MODEL` if you want a custom model name
  - `CLIENT_ORIGIN=https://dynamic-lecture-analyzer.vercel.app`

Frontend on Vercel:
- Root: `project`
- Build output: `frontend-react/dist`
- Env var: `VITE_BACKEND_URL=https://dynamic-lecture-analyzer.onrender.com`

Local test commands:

```powershell
cd "f:\Dynamic Lecture Analyzer\project\backend"
npm install
npm run dev
```

```powershell
cd "f:\Dynamic Lecture Analyzer\project\frontend-react"
npm install
npm run dev
```

MongoDB Atlas setup:
- Create a database user.
- Allow your IP or `0.0.0.0/0` for testing.
- Paste the connection string into `MONGODB_URI` on Render.

Notes:
- The backend accepts requests from localhost and from `https://dynamic-lecture-analyzer.vercel.app`.
- The React frontend is now the production Vercel app. The old Streamlit route is no longer used for deployment.
