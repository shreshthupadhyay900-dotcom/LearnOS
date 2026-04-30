const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const Group = require('../models/Group');
const User = require('../models/User');

// @desc  Get messages for a channel
router.get('/:channel', protect, async (req, res) => {
  try {
    const messages = await Message.find({ channel: req.params.channel })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { content, channel } = req.body;
    const message = await Message.create({
      user: req.user._id,
      userName: req.user.name,
      content,
      channel: channel || 'javascript-mastery',
      rank: req.user.xp > 5000 ? 'Visionary' : 'Scholar'
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Get list of groups/nodes
router.get('/groups/all', protect, async (req, res) => {
  try {
    const groups = await Group.find().limit(20);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Create a new group
router.post('/groups/create', protect, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const group = await Group.create({
      name,
      description,
      isPrivate,
      creator: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Get global leaderboard
router.get('/data/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select('name xp streak');
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const { model, cleanJSON } = require('../services/aiService');

// @desc  AI Channel Summarizer (Collective Wisdom)
router.post('/ai/summarize', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    const chatContent = messages.map(m => `${m.userName}: ${m.content}`).join('\n');
    
    const prompt = `Analyze study group conversation. Provide JSON with 'summary', 'topResources', and 'studyTip'.
      Discussion:
      ${chatContent}`;

    const result = await model.generateContent(prompt);
    res.json(cleanJSON(result.response.text()));
  } catch (error) {
    res.json({ 
      summary: "Discussion active. Keep sharing knowledge!", 
      topResources: ["Official Documentation", "EduAI Notes"],
      studyTip: "Try explaining the concept to a peer to solidify your understanding."
    });
  }
});

module.exports = router;
