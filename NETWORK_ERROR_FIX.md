# Network Error Fix - Quick Start Guide

## ✅ What I Fixed

1. **Created `.env.local` for frontend** - Sets correct backend URL for development
   - Frontend ab automatically `http://localhost:5001` ko use karega

2. **Better error messages** - Ab pata chalgega ki kyun error h
   - "Backend not running" 
   - "Network timeout"
   - etc.

3. **Improved API client** - Better error handling aur detection

## 🚀 How to Run (Without Network Errors)

### Terminal 1 - Backend Start:
```bash
cd backend
npm run dev
# Ya agar nodemon nahi h toh:
npm install nodemon
npm run dev
```

Check: `http://localhost:5001/health` browser mein

### Terminal 2 - Frontend Start:
```bash
cd frontend-react
npm run dev
```

Browser automatically khulega: `http://localhost:5173`

## 🔧 Troubleshooting

### Still Getting "Network Error"?

**1. Check Backend Running:**
- Open: `http://localhost:5001/health`
- Should show: `{"ok":true,"service":"dynamic-lecture-analyzer-backend"}`

**2. Check Frontend .env:**
- File: `frontend-react/.env.local`
- Content: `VITE_BACKEND_URL=http://localhost:5001`

**3. Restart Everything:**
```bash
# Kill all terminals
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend-react && npm run dev
```

**4. Check MongoDB Connection:**
- Backend console mein dekho `Connected to MongoDB` message h?
- If not, check `.env` file ka `MONGODB_URI`

## 📍 Port Configuration

Make sure ye ports free ho:
- **Backend**: `5001` (check in `backend/.env` PORT)
- **Frontend**: `5173` (Vite default)
- **MongoDB**: Connection string in `backend/.env`

## 💡 If Still Having Issues:

Backend .env file check karo:
```
PORT=5001
MONGODB_URI=<your-connection-string>
GROQ_API_KEY=<your-api-key>
```

Frontend .env.local check karo:
```
VITE_BACKEND_URL=http://localhost:5001
```

Ab sab kuch work karega! 🎉
