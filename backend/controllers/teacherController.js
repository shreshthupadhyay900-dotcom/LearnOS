const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Message = require('../models/Message');
const Goal = require('../models/Goal');

// @desc  Get teacher dashboard stats + recent activity
// @route GET /api/teacher/dashboard
const getTeacherDashboard = async (req, res, next) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' }).select('name email avatar xp streak createdAt');

    // Assignments this teacher deployed
    const deployedAssignments = await Assignment.find({ assignedBy: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Quizzes this teacher deployed
    const deployedQuizzes = await Quiz.find({ assignedBy: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Unread messages sent to teacher
    const unreadMessages = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    // Compute stats
    const gradedAssignments = deployedAssignments.filter(a => a.status === 'graded');
    const avgScore = gradedAssignments.length
      ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / gradedAssignments.length)
      : 0;

    // Build recent activity feed
    const recentAssignments = deployedAssignments.slice(0, 6).map(a => ({
      type: 'assignment',
      student: a.userId?.name || 'Unknown',
      studentId: a.userId?._id,
      action: a.status === 'graded' ? 'completed a mission' : 'has a pending mission',
      topic: a.title,
      score: a.score,
      grade: a.grade,
      status: a.status,
      time: a.updatedAt || a.createdAt
    }));

    const recentQuizzes = deployedQuizzes.slice(0, 4).map(q => ({
      type: 'quiz',
      student: q.userId?.name || 'Unknown',
      studentId: q.userId?._id,
      action: q.status === 'completed' ? 'completed a quiz' : 'has a pending quiz',
      topic: q.topic,
      score: q.score,
      status: q.status,
      time: q.updatedAt || q.createdAt
    }));

    const activity = [...recentAssignments, ...recentQuizzes]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalStudents: students.length,
        missionsDeployed: deployedAssignments.length + deployedQuizzes.length,
        avgClassPerformance: avgScore,
        pendingDoubts: unreadMessages,
        pendingMissions: deployedAssignments.filter(a => a.status === 'pending').length
      },
      activity,
      students: students.map(s => ({
        ...s.toObject(),
        assignmentsCount: deployedAssignments.filter(a => a.userId?.toString() === s._id.toString()).length,
        avgScore: (() => {
          const sa = deployedAssignments.filter(a => a.userId?.toString() === s._id.toString() && a.status === 'graded');
          return sa.length ? Math.round(sa.reduce((sum, a) => sum + (a.score || 0), 0) / sa.length) : null;
        })()
      }))
    });
  } catch (error) { next(error); }
};

// @desc  Get all students with detailed stats for teacher
// @route GET /api/teacher/students
const getStudentsWithStats = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email avatar xp streak createdAt');

    const studentsWithStats = await Promise.all(students.map(async (s) => {
      const assignments = await Assignment.find({ userId: s._id, assignedBy: req.user._id });
      const quizzes = await Quiz.find({ userId: s._id, assignedBy: req.user._id });
      const goals = await Goal.find({ userId: s._id, status: 'in-progress' });
      const gradedAssignments = assignments.filter(a => a.status === 'graded');
      const completedQuizzes = quizzes.filter(q => q.status === 'completed');

      return {
        ...s.toObject(),
        assignmentsTotal: assignments.length,
        assignmentsPending: assignments.filter(a => a.status === 'pending').length,
        assignmentsCompleted: gradedAssignments.length,
        quizzesTotal: quizzes.length,
        quizzesCompleted: completedQuizzes.length,
        avgAssignmentScore: gradedAssignments.length
          ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / gradedAssignments.length)
          : null,
        avgQuizScore: completedQuizzes.length
          ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizzes.length)
          : null,
        recentAssignments: assignments.slice(0, 3).map(a => ({
          _id: a._id, title: a.title, topic: a.topic, status: a.status, score: a.score, grade: a.grade, createdAt: a.createdAt
        })),
        recentQuizzes: quizzes.slice(0, 3).map(q => ({
          _id: q._id, topic: q.topic, status: q.status, score: q.score, createdAt: q.createdAt
        })),
        activeGoals: goals.map(g => ({
          _id: g._id, title: g.title, type: g.type, progress: g.progress, targetDate: g.targetDate
        }))
      };
    }));

    res.json({ success: true, students: studentsWithStats });
  } catch (error) { next(error); }
};

// @desc  Get conversation between teacher and a student
// @route GET /api/teacher/messages/:studentId
const getStudentConversation = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.studentId },
        { sender: req.params.studentId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name avatar role')
    .populate('receiver', 'name avatar role')
    .sort({ createdAt: 1 });

    // Mark messages to teacher as read
    await Message.updateMany(
      { sender: req.params.studentId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) { next(error); }
};

// @desc  Get assignment detail for teacher
// @route GET /api/teacher/assignments/:id
const getAssignmentDetail = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    
    // Security check: only the teacher who assigned it or any teacher (if system allows)
    // For now, let any teacher see student assignments to facilitate review
    res.json({ success: true, assignment });
  } catch (error) { next(error); }
};

// @desc  Get quiz detail for teacher
// @route GET /api/teacher/quizzes/:id
const getQuizDetail = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    
    res.json({ success: true, quiz });
  } catch (error) { next(error); }
};

module.exports = { 
  getTeacherDashboard, 
  getStudentsWithStats, 
  getStudentConversation,
  getAssignmentDetail,
  getQuizDetail
};
