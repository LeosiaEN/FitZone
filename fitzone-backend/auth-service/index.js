const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// ==============================================================================
// ROUTES & HEALTH CHECK
// ==============================================================================

app.get('/api', (req, res) => {
    res.json({ status: 'UP', service: 'Auth Service' });
});

app.use('/api/auth', authRoutes);

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

app.listen(PORT, () => {
    console.log(`🚀 Auth service running on port ${PORT}`);
});
