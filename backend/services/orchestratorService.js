const { searchKnowledgeBase } = require('./vectorService');
const UserMemory = require('../models/UserMemory');
const User = require('../models/User');
const { model, proModel, cleanJSON } = require('./aiService');

/**
 * The Central Brain of EduAI
 * Routes requests to specific agents based on intent
 */
const orchestrateResponse = async (userId, message, chatId) => {
  try {
    // 1. Fetch User Profile & Memory
    const user = await User.findById(userId);
    let memory = await UserMemory.findOne({ userId });
    if (!memory) memory = await UserMemory.create({ userId });

    // 2. Intent Analysis & Emotion Detection
    const intentAnalysis = await analyzeIntent(message);
    const { intent, emotion, subject } = intentAnalysis;

    // 3. RAG: Retrieve Context from Knowledge Base
    const context = await searchKnowledgeBase(message);
    const contextString = context.map(c => `[SOURCE: ${c.source}]: ${c.text}`).join('\n');

    // 4. Select Agent & Generate Response
    const agentPrompt = getAgentPrompt(intent, user, memory, contextString, emotion);
    
    const result = await proModel.generateContent(`[SYSTEM]: ${agentPrompt}\n[USER]: ${message}`);
    const aiOutput = cleanJSON(result.response.text());

    // 5. Post-process: Update Memory based on AI output
    updateUserMemory(userId, aiOutput, intent);

    return {
      ...aiOutput,
      intent,
      emotion,
      sources: context.map(c => c.source)
    };
  } catch (error) {
    console.error('Orchestration Error:', error);
    return {
      answer: "I'm having trouble processing that right now. Let's try again in a moment.",
      difficulty: "medium",
      next_topic: "Reviewing previous concepts",
      confidence: 0,
      resources: []
    };
  }
};

/**
 * Detect user intent and emotion
 */
const analyzeIntent = async (message) => {
  try {
    const prompt = `Analyze user message. Return raw JSON with 'intent' (TUTOR, QUIZ, SCHOLARSHIP, INTERVIEW, MOTIVATION, MENTOR, GOALS), 'emotion' (FRUSTRATED, CONFUSED, EXCITED, NEUTRAL), and 'subject'.
      Message: "${message}"`;
    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (e) {
    return { intent: 'TUTOR', emotion: 'NEUTRAL', subject: 'General' };
  }
};

/**
 * Get specialized prompt for the selected agent
 */
const getAgentPrompt = (intent, user, memory, context, emotion) => {
  const baseInstructions = `
    You are EduAI, an Elite AI Tutor and Mentor.
    Current User: ${user.name}
    Learning Style: ${memory.learningStyle}
    Weak Topics: ${memory.weakTopics.map(t => t.topic).join(', ')}
    Detected Emotion: ${emotion}
    
    KNOWLEDGE BASE CONTEXT (RAG):
    ${context || "No specific local knowledge found."}
    
    STRICT RULES:
    1. Ground all technical answers in the provided context.
    2. MUST return response in this JSON format:
    {
      "answer": "...",
      "difficulty": "easy | medium | hard",
      "next_topic": "...",
      "confidence": 0.0-1.0,
      "resources": [{"title": "...", "url": "...", "type": "video | article"}]
    }
  `;

  const agentPrompts = {
    TUTOR: "Focus on teaching. Use Socratic method.",
    QUIZ: "Quiz Master. Generate challenging questions.",
    SCHOLARSHIP: "Financial Aid Advisor. Focus on eligibility.",
    INTERVIEW: "FAANG Senior Interviewer. Professional and rigorous.",
    MOTIVATION: "Motivational Speaker. Use empathy if FRUSTRATED.",
    MENTOR: "Life Coach. Provide strategic advice.",
    GOALS: "Roadmap planner. Break into habits."
  };

  return `${baseInstructions}\n\n[AGENT ROLE]: ${agentPrompts[intent] || agentPrompts.TUTOR}`;
};

const updateUserMemory = async (userId, aiOutput, intent) => {
  try {
    const memory = await UserMemory.findOne({ userId });
    if (!memory) return;

    if (aiOutput.confidence < 0.6 && aiOutput.next_topic) {
      const topicExists = memory.weakTopics.find(t => t.topic === aiOutput.next_topic);
      if (!topicExists) {
        memory.weakTopics.push({ topic: aiOutput.next_topic, lastAttempted: new Date(), score: aiOutput.confidence * 100 });
      }
    }
    await memory.save();
  } catch (err) {
    console.error('Memory Update Error:', err);
  }
};

module.exports = { orchestrateResponse };
