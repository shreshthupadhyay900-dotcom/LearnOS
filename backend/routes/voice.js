const express = require('express');
const { body } = require('express-validator');
const { voiceQuery } = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.post('/query', validate([body('transcript').notEmpty().withMessage('Transcript is required')]), voiceQuery);

module.exports = router;
