const express = require('express');
const { body } = require('express-validator');
const { 
  getAssignments, 
  generateAssignment, 
  submitAssignment, 
  getAssignment 
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getAssignments);
router.post('/generate', validate([body('topic').notEmpty().withMessage('Topic is required')]), generateAssignment);
router.get('/:id', getAssignment);
router.post('/:id/submit', validate([body('content').notEmpty().withMessage('Content is required')]), submitAssignment);

module.exports = router;
