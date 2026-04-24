const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedUsers = require('./scripts/seed');

// Load env vars
dotenv.config();

// Connect to database (mocked if no URI provided)
connectDB().then(() => {
  // Auto-seed in memory mode for seamless verification
  if (process.env.IS_MEMORY_DB === 'true') {
    seedUsers();
  }
});

const app = express();
app.set('trust proxy', 1);

const parseAllowedOrigins = (rawValue) => {
  if (!rawValue) return null;
  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

// Middleware
const isProduction = process.env.NODE_ENV === 'production';
const corsOriginSetting = (process.env.CORS_ORIGIN || '').trim();
const configuredAllowedOrigins = parseAllowedOrigins(corsOriginSetting);

// In production, require an explicit CORS_ORIGIN (or '*') to avoid accidentally opening the API.
// In development, allow all origins by default for convenience.
const allowAllOrigins = corsOriginSetting === '*' || (!isProduction && !corsOriginSetting);
const allowedOrigins = configuredAllowedOrigins || [];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const originMatches = (allowed, origin) => {
  if (!allowed) return false;
  if (allowed === origin) return true;
  if (!allowed.includes('*')) return false;
  const pattern = `^${allowed.split('*').map(escapeRegex).join('.*')}$`;
  return new RegExp(pattern).test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowAllOrigins) return callback(null, true);

      if (allowedOrigins.some((allowed) => originMatches(allowed, origin))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
  }),
);
app.use(express.json());

// Load Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HostelHub API is running smoothly.' });
});

// Test API Route
app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Test API route is working correctly.' });
});

// Dashboard API Route
app.get('/api/dashboard', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'Dashboard data connected successfully!' } });
});

// API 404 (prevents frontend routing from hiding API typos)
app.use('/api', (req, res) => {
  res
    .status(404)
    .json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[INTERNAL ERROR]:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
