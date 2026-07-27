const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.post('/submit', assignmentController.submitAssignment);

module.exports = router;
