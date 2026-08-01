const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ==============================================================================
// SERVICE ENDPOINTS & RESILIENCE PROXY
// ==============================================================================

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:5002',
  workout: process.env.WORKOUT_SERVICE_URL || 'http://workout-service:5003',
  nutrition: process.env.NUTRITION_SERVICE_URL || 'http://nutrition-service:5004',
  tracking: process.env.TRACKING_SERVICE_URL || 'http://tracking-service:5005'
};

const createResilientProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`[API Gateway Proxy Error] ${targetUrl}: ${err.message}`);
      res.status(503).json({
        status: 'ERROR',
        message: 'Hedef mikroservis şu an yanıt vermiyor.',
        target: targetUrl
      });
    }
  });
};

// ==============================================================================
// ROUTE PROXIES
// ==============================================================================

app.use('/api/auth', createResilientProxy(SERVICES.auth));
app.use('/api/users', createResilientProxy(SERVICES.user));
app.use('/api/workouts', createResilientProxy(SERVICES.workout));
app.use('/api/exercises', createResilientProxy(SERVICES.workout));
app.use('/api/nutrition', createResilientProxy(SERVICES.nutrition));
app.use('/track', createResilientProxy(SERVICES.tracking));
app.use('/api/tracking', createResilientProxy(SERVICES.tracking));

// ==============================================================================
// HEALTH & MONITORING ENDPOINTS
// ==============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'FitZone API Gateway aktif' });
});

app.get('/health/services', async (req, res) => {
  const checkService = (name, url) => {
    return new Promise((resolve) => {
      const request = http.get(`${url}/api`, { timeout: 1500 }, (response) => {
        resolve({ service: name, status: response.statusCode < 400 ? 'UP' : 'DEGRADED', statusCode: response.statusCode });
      });
      request.on('error', () => {
        resolve({ service: name, status: 'DOWN', error: 'Baglanti reddedildi / Zaman asimi' });
      });
      request.on('timeout', () => {
        request.destroy();
        resolve({ service: name, status: 'TIMEOUT' });
      });
    });
  };

  const results = await Promise.all(
    Object.entries(SERVICES).map(([name, url]) => checkService(name, url))
  );

  res.json({
    gateway: 'UP',
    timestamp: new Date().toISOString(),
    services: results
  });
});

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 FitZone API Gateway running on port ${PORT}`);
  });
}

module.exports = app;
