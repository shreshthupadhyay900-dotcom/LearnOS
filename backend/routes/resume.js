const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id : 'anonymous';
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

router.post('/analyze', upload.single('resume'), analyzeResume);

module.exports = router;
