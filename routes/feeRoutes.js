const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.get('/', feeController.getFees);
router.post('/:id/pay', feeController.payFee);

module.exports = router;
