const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const router = require('./routes/exerciseHistory');

dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// ==============================================================================
// ROUTES & HEALTH CHECK
// ==============================================================================

app.use('/track', router);

app.get('/api', (req, res) => {
  res.json({ status: 'UP', service: 'Tracking Service' });
});

app.post('/api', (req, res) => {
  const { exercise, sets, reps, userId } = req.body;
  if (!exercise || !sets || !reps || !userId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  res.status(201).json({ message: 'Tracking data saved successfully', data: req.body });
});

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

app.listen(port, () => {
  console.log(`🚀 Tracking service running on port ${port}`);
});
