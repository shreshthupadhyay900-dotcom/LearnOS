const Goal = require('../models/Goal');
const User = require('../models/User');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @desc  Generate a new AI roadmap/goal
// @route POST /api/goals/generate
const generateGoal = async (req, res, next) => {
  try {
    const { title, type, targetDate } = req.body;
    const userId = req.user._id;

    const prompt = `Act as an Elite Career Architect. Create a master-level learning roadmap for: "${title}". 
      Goal Type: ${type}. 
      Target Date: ${targetDate}.
      
      Requirements:
      1. Provide 4-5 core milestones.
      2. Each milestone MUST have 2-3 specific learning resources (YouTube links or Documentation).
      3. Assign a complexity level (easy, medium, hard) to each milestone.
      4. Provide 6 immediate daily tasks to bootstrap the journey.
      
      Return ONLY valid JSON in this format:
      {
        "milestones": [
          { 
            "title": "...", 
            "description": "...", 
            "complexity": "...", 
            "resources": [{ "title": "...", "url": "...", "type": "video|article|docs" }] 
          }
        ],
        "dailyTasks": [
          { "text": "...", "xpValue": 25 }
        ]
      }`;

    let roadmapData;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [{ role: "system", content: "You are a professional roadmap architect. Always return valid JSON." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      roadmapData = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error('AI Roadmap Generation Failed, using fallback:', err);
      roadmapData = {
        milestones: [
          { title: "Foundations of " + title, description: "Master the basics.", complexity: "easy", resources: [{ title: "Official Guide", url: "https://docs.google.com", type: "docs" }] },
          { title: "Intermediate " + title, description: "Core concepts.", complexity: "medium", resources: [{ title: "Tutorial Video", url: "https://youtube.com", type: "video" }] }
        ],
        dailyTasks: [
          { text: "Read documentation for 30 mins", xpValue: 20 },
          { text: "Write code for 1 hour", xpValue: 50 }
        ]
      };
    }

    const goal = await Goal.create({
      userId,
      title,
      type,
      targetDate,
      milestones: roadmapData.milestones,
      dailyTasks: roadmapData.dailyTasks,
      aiRoadmapJson: JSON.stringify(roadmapData)
    });

    res.status(201).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc  Get user goals
// @route GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id, status: 'in-progress' }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) { next(error); }
};

// @desc  Update task status and award XP
// @route PUT /api/goals/:goalId/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const { goalId, taskId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user._id;

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const task = goal.dailyTasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Only award XP if transitioning from not completed to completed
    if (!task.isCompleted && isCompleted) {
      await User.findByIdAndUpdate(userId, { $inc: { xp: task.xpValue || 10 } });
    }

    task.isCompleted = isCompleted;

    // Update progress
    const completedTasks = goal.dailyTasks.filter(t => t.isCompleted).length;
    goal.progress = Math.round((completedTasks / goal.dailyTasks.length) * 100);

    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

module.exports = { generateGoal, getGoals, updateTask };
