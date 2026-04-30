const express = require('express');
const { getNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotes);

module.exports = router;
