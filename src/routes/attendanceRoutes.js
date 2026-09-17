const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAttendance);
router.post('/batch', attendanceController.saveBatchAttendance);

module.exports = router;
