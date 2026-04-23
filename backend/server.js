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

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 [INTERNAL ERROR]:', err.stack);
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
