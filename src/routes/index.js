const express = require('express');
const router = express.Router();
const { isDatabaseReady } = require('../config/database');

router.get('/health', (req, res) => {
  res.json({
    status: 200,
    success: true,
    service: 'EduPulse API',
    database: isDatabaseReady() ? 'connected' : 'offline',
    timestamp: new Date().toISOString()
  });
});

// A request that reaches a route while Mongo is down would otherwise hang on
// mongoose's buffering timeout; answer it immediately so the browser can fall
// back to its local store on the first try.
router.use((req, res, next) => {
  if (req.path === '/health' || isDatabaseReady()) return next();
  res.status(503).json({
    status: 503,
    success: false,
    message: 'Database unavailable'
  });
});

router.use('/auth', require('./authRoutes'));
router.use('/students', require('./studentRoutes'));
router.use('/teachers', require('./teacherRoutes'));
router.use('/classes', require('./classRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/assignments', require('./assignmentRoutes'));
router.use('/fees', require('./feeRoutes'));
router.use('/notices', require('./noticeRoutes'));

module.exports = router;
