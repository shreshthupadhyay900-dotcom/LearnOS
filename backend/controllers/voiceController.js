const { chatWithAI } = require('../services/aiService');

// @desc  Voice input → AI response (speech-to-text hook)
// @route POST /api/voice/query
const voiceQuery = async (req, res, next) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ success: false, message: 'Transcript is required' });

    const messages = [{ role: 'user', content: transcript }];
    const reply = await chatWithAI(messages, 'normal');

    res.json({ success: true, transcript, reply });
  } catch (error) { next(error); }
};

module.exports = { voiceQuery };
