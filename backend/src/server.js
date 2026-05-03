const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const analyzeRoute = require('./routes/analyzeRoute');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:8501',
  'http://localhost:5173',
  'https://dynamic-lecture-analyzer.vercel.app',
];

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

connectDB();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'dynamic-lecture-analyzer-backend',
    health: '/health',
    analyze: '/api/analyze',
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'dynamic-lecture-analyzer-backend' });
});

app.use('/api', analyzeRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
