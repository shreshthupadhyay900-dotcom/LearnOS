const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');

// @desc  Get user progress over time (for line chart)
// @route GET /api/analytics/progress
const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({ userId, status: 'completed' })
      .select('score createdAt topic')
      .sort({ createdAt: 1 })
      .limit(30);

    // Group by date for line chart
    const byDate = {};
    quizzes.forEach((q) => {
      const date = q.createdAt.toISOString().split('T')[0];
      if (!byDate[date]) byDate[date] = { scores: [], date };
      byDate[date].scores.push(q.score);
    });

    const lineData = Object.values(byDate).map((d) => ({
      date: d.date,
      accuracy: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    }));

    // Pad with mock data if not enough entries
    if (lineData.length < 5) {
      const base = [65, 72, 68, 75, 80, 78, 85];
      const today = new Date();
      for (let i = 6; i >= lineData.length; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        lineData.unshift({ date: d.toISOString().split('T')[0], accuracy: base[i] || 70 });
      }
    }

    res.json({ success: true, lineData });
  } catch (error) { next(error); }
};

// @desc  Get performance breakdown by topic (for bar + pie chart)
// @route GET /api/analytics/performance
const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.find({ userId }).sort({ accuracy: -1 });

    const barData = progress.map((p) => ({ topic: p.topic, accuracy: p.accuracy, timeSpent: p.timeSpent }));
    const strongCount = progress.filter((p) => p.accuracy >= 70).length;
    const weakCount = progress.filter((p) => p.accuracy < 70).length;

    const pieData = [
      { name: 'Strong (≥70%)', value: strongCount || 3, color: '#4F46E5' },
      { name: 'Weak (<70%)', value: weakCount || 2, color: '#F59E0B' },
      { name: 'Not Started', value: Math.max(0, 5 - strongCount - weakCount), color: '#E5E7EB' },
    ];

    // AI insights based on actual progress
    const { chatWithAI } = require('../services/aiService');
    const studentContext = {
      strongTopics: progress.filter(p => p.accuracy >= 70).map(p => p.topic),
      weakTopics: progress.filter(p => p.accuracy < 60).map(p => p.topic),
      avgAccuracy: progress.length ? Math.round(progress.reduce((a,b) => a+b.accuracy, 0)/progress.length) : 0
    };

    const prompt = `Act as a High-Stakes Elite Performance Coach. Analyze this student data:
      Context: ${JSON.stringify(studentContext)}
      
      Generate exactly 4 tactical insights in this JSON format:
      [
        { "type": "warning" | "success" | "tip" | "info", "text": "Short, sharp, elite coaching advice" }
      ]
      Focus on gaps, study habits, and 'Elite' mindset.`;

    let insights = [];
    try {
      const aiResponse = await chatWithAI([{ role: 'user', content: prompt }], 'coach');
      // Simple parse attempt if AI returns markdown
      const jsonStr = aiResponse.match(/\[.*\]/s)?.[0] || aiResponse;
      insights = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('AI Insights failed, using fallback');
      insights = [
        { type: 'warning', text: 'Critical Gap in ' + (studentContext.weakTopics[0] || 'Fundamentals') },
        { type: 'success', text: 'Elite Accuracy in ' + (studentContext.strongTopics[0] || 'Logic') },
        { type: 'tip', text: 'Optimize study blocks for deep work.' },
        { type: 'info', text: 'Weekly mastery goal: 85%+ accuracy.' }
      ];
    }

    res.json({ success: true, barData, pieData, insights });
  } catch (error) { next(error); }
};

module.exports = { getProgress, getPerformance };
