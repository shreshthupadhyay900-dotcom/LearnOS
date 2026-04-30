const express = require('express');
const { generateGoal, getGoals, updateTask } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/generate', generateGoal);
router.get('/', getGoals);
router.put('/:goalId/tasks/:taskId', updateTask);

module.exports = router;
