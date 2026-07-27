const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupulse';

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend Assets (HTML, CSS, JS) directly from root folder
app.use(express.static(path.join(__dirname)));

// Request logging middleware
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB database successfully.'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 200,
    success: true,
    message: 'EduPulse Node.js + Express.js API server running',
    timestamp: new Date().toISOString()
  });
});

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));

// Fallback to index.html for SPA page loads
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ status: 500, success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EduPulse Unified Full-Stack Application running at http://localhost:${PORT}`);
});
