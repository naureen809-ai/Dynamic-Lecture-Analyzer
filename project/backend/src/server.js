const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const analyzeRoute = require('./routes/analyzeRoute');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8501';

connectDB();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

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
