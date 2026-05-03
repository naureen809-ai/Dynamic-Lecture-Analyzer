# Dynamic Lecture Analyzer

Production-ready setup:
- Frontend: React + Vite + Tailwind in `frontend-react`
- Backend: Express + MongoDB + OpenAI in `backend`
- Deployment: Vercel frontend, Render backend, MongoDB Atlas database

## Quick start

Backend:

```powershell
cd "f:\Dynamic Lecture Analyzer\project\backend"
npm install
npm run dev
```

Frontend:

```powershell
cd "f:\Dynamic Lecture Analyzer\project\frontend-react"
npm install
npm run dev
```

## Deployment URLs

- Backend: `https://dynamic-lecture-analyzer.onrender.com`
- Frontend: `https://dynamic-lecture-analyzer.vercel.app`

## Environment variables

Backend Render:
- `MONGODB_URI`
- `CLIENT_ORIGIN=https://dynamic-lecture-analyzer.vercel.app`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Frontend Vercel:
- `VITE_BACKEND_URL=https://dynamic-lecture-analyzer.onrender.com`

## Notes

- If OpenAI is not configured, the backend still works with a local fallback.
- The React frontend is the production Vercel app. The older Streamlit setup is no longer used for deployment.
