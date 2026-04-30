const express = require('express');
const { 
  getTeacherDashboard, 
  getStudentsWithStats, 
  getStudentConversation,
  getAssignmentDetail,
  getQuizDetail
} = require('../controllers/teacherController');
const { uploadNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for notes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id : 'anonymous';
    cb(null, `note-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

const router = express.Router();
router.use(protect);

// Middleware: ensure only teachers access these routes
router.use((req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Faculty access only.' });
  }
  next();
});

router.get('/dashboard', getTeacherDashboard);
router.get('/students', getStudentsWithStats);
router.get('/messages/:studentId', getStudentConversation);
router.get('/assignments/:id', getAssignmentDetail);
router.get('/quizzes/:id', getQuizDetail);

// Notes Management
router.post('/notes/upload', upload.single('note'), uploadNote);
router.get('/notes', getNotes);
router.delete('/notes/:id', deleteNote);

module.exports = router;
