# Dynamic Lecture Analyzer

Clean production-style starter for lecture analysis.

## Project Structure

```text
project/
  backend/
    src/
      config/
      models/
      routes/
      services/
      server.js
    package.json
    .env.example
  frontend/
    app.py
    api_client.py
    requirements.txt
    .env.example
  docs/
  vercel.json
```

## What Works Right Now

- `POST /api/analyze`
- MongoDB save on every analysis
- OpenAI analysis when `OPENAI_API_KEY` is set
- Safe local fallback when OpenAI key is missing
- Dark SaaS-style Streamlit dashboard

## Backend Setup

### Commands

```powershell
cd "f:\Dynamic Lecture Analyzer\project\backend"
npm install
Copy-Item .env.example .env
npm run dev
```

### `.env`

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/dynamic_lecture_analyzer?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:8501
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Frontend Setup

### Commands

```powershell
cd "f:\Dynamic Lecture Analyzer\project\frontend"
& "f:/Dynamic Lecture Analyzer/.venv/Scripts/python.exe" -m pip install -r requirements.txt
Copy-Item .env.example .env
streamlit run app.py
```

### `.env`

```env
BACKEND_URL=http://localhost:5001
```

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Add your IP in Network Access.
5. Paste the connection string into `MONGODB_URI`.
6. Collection `lectures` is created automatically by Mongoose.

## API Test

### Health

```powershell
Invoke-RestMethod http://localhost:5001/health
```

### Analyze

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/analyze' -ContentType 'application/json' -Body '{"text":"This is a sample lecture text."}'
```

Expected response contains:
- transcript
- summary
- keyPoints
- explanation
- sentiment
- readabilityScore

## Deployment

### Backend on Render or Railway

- Connect the `project/backend` folder to the host.
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `PORT`
  - `MONGODB_URI`
  - `CLIENT_ORIGIN`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`

### Frontend on Streamlit-friendly hosting

- Best option: Streamlit Community Cloud or Render.
- Vercel is not ideal for a full Streamlit server.
- Use Vercel only if you want a lightweight landing page, not the main Streamlit UI.

## Notes

- If `OPENAI_API_KEY` is missing, the app still works using a local fallback.
- Once the key is added, the backend automatically switches to OpenAI.
