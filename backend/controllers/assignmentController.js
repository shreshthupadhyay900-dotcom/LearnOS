const Assignment = require('../models/Assignment');
const { generateStructuredAssignment, evaluateStructuredAssignment } = require('../services/aiService');

// @desc  Get all assignments
// @route GET /api/assignments
const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id })
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    console.log(`FETCHED ${assignments.length} MISSIONS FOR STUDENT: ${req.user.name}`);
    res.json({ success: true, assignments });
  } catch (error) { next(error); }
};

// @desc  Generate and create assignment from topic
// @route POST /api/assignments/generate
const generateAssignment = async (req, res, next) => {
  try {
    const { topic, difficulty = 'professional', studentId } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

    // Map frontend difficulty to Assignment enum
    const difficultyMap = {
      novice: 'novice',
      professional: 'professional',
      expert: 'expert',
      beginner: 'novice',
      intermediate: 'professional'
    };
    const targetDifficulty = difficultyMap[difficulty] || 'professional';

    // If teacher is assigning, use the provided studentId, else use own _id
    const targetUserId = (req.user.role === 'teacher' && studentId) ? studentId : req.user._id;

    const aiAssignment = await generateStructuredAssignment(topic, targetDifficulty);
    
    const assignment = await Assignment.create({
      userId: targetUserId,
      assignedBy: req.user.role === 'teacher' ? req.user._id : undefined,
      topic,
      difficulty: targetDifficulty,
      title: aiAssignment.title,
      description: aiAssignment.description,
      subject: aiAssignment.subject,
      duration: aiAssignment.duration,
      tasks: aiAssignment.tasks,
      status: 'pending'
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) { 
    console.error('GENERATE ASSIGNMENT ERROR:', error);
    next(error); 
  }
};

// @desc  Submit assignment
// @route POST /api/assignments/:id/submit
const submitAssignment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    assignment.content = content;
    assignment.status = 'submitted';
    assignment.submittedAt = new Date();

    // Evaluate with AI
    const evaluation = await evaluateStructuredAssignment(content, assignment);
    
    assignment.feedback = evaluation.feedback;
    assignment.grade = evaluation.grade;
    assignment.score = evaluation.score;
    assignment.strengths = evaluation.strengths || [];
    assignment.improvements = evaluation.improvements || [];
    assignment.wrongAnswers = evaluation.wrongAnswers || [];
    assignment.analysis = evaluation.analysis;
    assignment.status = 'graded';
    
    await assignment.save();

    res.json({ success: true, assignment });
  } catch (error) { next(error); }
};

// @desc  Get single assignment
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('assignedBy', 'name');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) { next(error); }
};

module.exports = { 
  getAssignments, 
  generateAssignment, 
  submitAssignment, 
  getAssignment 
};
