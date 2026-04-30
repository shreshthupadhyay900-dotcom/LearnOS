const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Fallback to flash for reliability

const USE_MOCK = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_key';

// Helper to clean JSON from Gemini responses (handles markdown blocks)
const cleanJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    let jsonStr = text.replace(/```json\n?|```/g, '').trim();
    // Find the first { and last } to isolate the object
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON Cleanup Error:', e, 'Raw text:', text);
    throw new Error('AI Response was not valid JSON. Please try again.');
  }
};

const mockChatReply = (messages) => {
  const last = messages[messages.length - 1]?.content || '';
  return `Great question! Here's what I know about **"${last.slice(0, 60)}"**:\n\n` +
    `This is a fundamental concept in computer science. Let me break it down step by step:\n\n` +
    `1. **Definition**: The core idea involves applying logical operations to solve the problem.\n` +
    `2. **Key Principle**: Understanding the base case and recursive step is crucial.\n` +
    `3. **Example**: Consider a simple implementation...\n\n` +
    `\`\`\`python\ndef example(n):\n    if n <= 1:\n        return n\n    return example(n-1) + example(n-2)\n\`\`\`\n\n` +
    `Would you like me to **explain simply**, give more **examples**, or **generate a quiz** on this topic?`;
};

const mockQuiz = (topic) => ({
  topic,
  questions: [
    { text: `What is the primary purpose of ${topic}?`, options: ['To store data', 'To process information efficiently', 'To manage memory', 'To handle errors'], correctAnswer: 'To process information efficiently', explanation: `${topic} is designed to handle information processing in an organized manner.` },
    { text: `Which of the following best describes ${topic}?`, options: ['A data structure', 'An algorithm paradigm', 'A programming language', 'A design pattern'], correctAnswer: 'An algorithm paradigm', explanation: `${topic} follows specific algorithmic patterns.` },
    { text: `What is the time complexity of a basic ${topic} operation?`, options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 'O(n)', explanation: 'Linear time complexity is typical for this type of operation.' },
    { text: `Which use case is most suitable for ${topic}?`, options: ['Sorting large datasets', 'Real-time processing', 'Database indexing', 'Network routing'], correctAnswer: 'Real-time processing', explanation: `${topic} excels in real-time scenarios due to its efficiency.` },
    { text: `What is a key advantage of using ${topic}?`, options: ['Low memory usage', 'High readability', 'Improved performance', 'Easier debugging'], correctAnswer: 'Improved performance', explanation: `The main advantage of ${topic} is its performance characteristics.` },
  ],
});

const mockNotes = (topic) =>
  `# Notes on ${topic}\n\n## Overview\n${topic} is a fundamental concept widely used in software development.\n\n## Key Points\n- **Definition**: A systematic approach to solving ${topic}-related problems\n- **History**: Developed to address computational challenges\n- **Applications**: Used in web development, data science, and systems programming\n\n## Core Concepts\n1. **Principle 1**: Foundation of the concept\n2. **Principle 2**: Advanced application\n3. **Principle 3**: Real-world usage\n\n## Summary\nUnderstanding ${topic} is essential for any software engineer looking to write efficient, scalable code.`;

const mockEvaluation = (content) => ({
  grade: 'B+',
  score: 85,
  feedback: `Your submission demonstrates a solid understanding of the core concepts. The explanation is clear and well-structured. Consider adding more concrete examples to strengthen your arguments. The technical accuracy is good, though some edge cases could be explored further.`,
  strengths: ['Clear structure', 'Good technical accuracy', 'Well-organized content'],
  improvements: ['Add more examples', 'Explore edge cases', 'Deepen theoretical analysis'],
});

// ─── AI Service Functions ─────────────────────────────────────────────────────

/**
 * Chat with AI — sends message history for context-aware responses
 */
const chatWithAI = async (messages, persona = 'mentor', userContext = {}) => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return mockChatReply(messages);
  }

  const personaPrompts = {
    mentor: `You are LEARN OS, a Distinguished Professor of Computer Science and a world-renowned Technical Architect. Your mission is to provide an elite, transformative educational experience.
      - Tone: Professional, authoritative, yet deeply encouraging. Use a sophisticated vocabulary but explain complex concepts with crystalline clarity.
      - Strategy: Pedagogical leadership. Don't just answer; guide the student through the 'Neural Path'. Use high-level industry analogies (e.g., comparing system architecture to urban planning).
      - Style: Use markdown strictly. Highlight critical concepts in **bold**. Provide production-grade, optimized code examples. Always discuss trade-offs (Time/Space complexity) with a focus on real-world scalability.`,
    strict: `You are EduAI, an elite, high-standards FAANG Staff Engineer. You value precision, performance, and fault tolerance.
      - Tone: Professional, direct, highly technical.
      - Strategy: Break down concepts into logical axioms. Focus heavily on edge cases, scalability bottlenecks, and system design trade-offs. Challenge the student's architecture.`,
    coach: `You are EduAI, a competitive programming Grandmaster and Exam Strategist.
      - Tone: High-energy, strategic, highly efficient.
      - Strategy: Focus on pattern recognition, optimized approaches, and fast execution. Provide 'Key Takeaways' and 'Common Pitfalls'. Provide optimal code snippets immediately.`,
  };

  try {
    const lastMessage = messages[messages.length - 1].content;

    // Phase 1: Emotion Detection
    const emotionPrompt = `Analyze the sentiment and emotion of this student message: "${lastMessage}". 
      Return ONLY one word: FRUSTRATED, CONFUSED, CONFIDENT, BORED, or NEUTRAL.`;
    
    let emotion = 'NEUTRAL';
    try {
      const emotionResult = await model.generateContent(emotionPrompt);
      emotion = emotionResult.response.text().trim().toUpperCase();
    } catch (e) {
      console.warn('Emotion detection failed');
    }

    const adaptiveInstruction = {
      FRUSTRATED: "The student is frustrated. Be extra motivational and break things down.",
      CONFUSED: "The student is confused. Use a simple analogy.",
      CONFIDENT: "The student is confident. Challenge them.",
      BORED: "The student is bored. Show a cool real-world app.",
      NEUTRAL: "The student is engaged.",
    }[emotion] || "";

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const systemInstruction = personaPrompts[persona] || personaPrompts.mentor;
    const finalPrompt = `[PERSONALITY]: ${systemInstruction}\n[EMOTION]: ${adaptiveInstruction}\n[CONTEXT]: ${JSON.stringify(userContext)}\n\nMessage: ${lastMessage}`;

    const result = await chat.sendMessage(finalPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return mockChatReply(messages);
  }
};

/**
 * Generate an AI quiz
 */
const generateQuiz = async (topic, difficulty = 'medium', numQuestions = 5) => {
  if (USE_MOCK) return mockQuiz(topic);

  const prompt = `Generate a ${difficulty} difficulty quiz on "${topic}" with exactly ${numQuestions} MCQs.
    Return ONLY raw JSON:
    {
      "topic": "${topic}",
      "questions": [
        { "text": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }
      ]
    }`;

  try {
    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini Quiz Error:', error);
    return mockQuiz(topic);
  }
};

/**
 * Generate study notes
 */
const generateNotes = async (topic) => {
  if (USE_MOCK) return mockNotes(topic);
  const prompt = `Generate elite-level study notes in Markdown for: "${topic}". Include architecture, code, and Big-O.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return mockNotes(topic);
  }
};

/**
 * Evaluate assignment
 */
const evaluateAssignment = async (content, subject = 'General') => {
  if (USE_MOCK) return mockEvaluation(content);
  const prompt = `Rigorous evaluation of this ${subject} assignment: "${content}". 
    Return raw JSON: { "grade": "...", "score": 0-100, "feedback": "...", "strengths": [], "improvements": [] }`;
  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    return mockEvaluation(content);
  }
};

/**
 * Generate flashcards
 */
const generateFlashcards = async (topic) => {
  if (USE_MOCK) return [{ front: '...', back: '...' }];
  const prompt = `Generate 5 technical flashcards for: "${topic}". Return raw JSON array: [ { "front": "...", "back": "..." } ]`;
  try {
    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    return [{ front: 'Error', back: 'Please try again.' }];
  }
};

/**
 * Generate assignment draft
 */
const generateAssignmentDraft = async (title, description) => {
  if (USE_MOCK) return mockNotes(title);
  const prompt = `Draft a structural outline for: "${title}". Context: ${description}`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return 'Draft unavailable.';
  }
};

// ── Mock Model Fallback ───────────────────────────────────────────────────
class MockModel {
  async generateContent(prompt) {
    console.log('[MockModel] Simulating AI response for prompt...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Default mock response for resume analysis if detected in prompt
    if (prompt.includes('resume')) {
      return {
        response: {
          text: () => JSON.stringify({
            atsScore: 82,
            skills: ["JavaScript", "React", "Node.js", "REST APIs"],
            problems: ["Lacks quantifiable achievements", "Skills section is too generic"],
            improvements: ["Add metrics to project descriptions", "Target specific tech stack keywords"],
            suggestedRoadmap: "Advanced Frontend Engineering",
            companyAnalysis: "Good technical alignment, but needs more focus on product impact."
          })
        }
      };
    }

    return {
      response: {
        text: () => "This is a mock AI response because the Gemini API is unreachable or the key is invalid."
      }
    };
  }
  
  startChat() {
    return {
      sendMessage: async (msg) => this.generateContent(msg)
    };
  }
}

const safeModel = USE_MOCK ? new MockModel() : model;
const safeProModel = USE_MOCK ? new MockModel() : proModel;

/**
 * Teach a topic comprehensively — returns structured lesson content
 */
const teachTopic = async (topic, level = 'intermediate') => {
  if (USE_MOCK) {
    return {
      topic,
      overview: `${topic} is a foundational concept in computer science and engineering. Understanding it deeply enables you to write more efficient, scalable, and maintainable systems.`,
      sections: [
        { title: 'Core Concept', content: `At its heart, ${topic} is about solving problems through a systematic, well-defined approach. The fundamental principle is breaking down complexity into manageable pieces.`, code: `// Example: Basic ${topic} implementation\nfunction example(input) {\n  // Step 1: Validate input\n  if (!input) throw new Error('Invalid input');\n  // Step 2: Process\n  return input;\n}` },
        { title: 'Key Principles', content: `There are 3 core principles: (1) Abstraction – hiding complexity, (2) Decomposition – breaking into sub-problems, (3) Pattern Recognition – applying known solutions.`, code: null },
        { title: 'Real-World Applications', content: `${topic} powers major systems at companies like Google, Netflix and Amazon. For example, Netflix uses similar patterns to serve 200M+ concurrent users.`, code: null },
        { title: 'Common Pitfalls', content: `Beginners often make these mistakes: (1) Skipping edge-case handling, (2) Over-engineering simple solutions, (3) Ignoring time/space complexity trade-offs.`, code: `// Antipattern to avoid:\n// Don't nest too deeply - O(n³) complexity\nfor(let i=0;i<n;i++) for(let j=0;j<n;j++) for(let k=0;k<n;k++) {}` },
      ],
      keyTakeaways: [
        `${topic} is essential for building scalable systems`,
        'Always analyze time and space complexity',
        'Real-world context helps solidify abstract concepts',
        'Practice with varied problem types to build fluency'
      ],
      estimatedReadTime: 8
    };
  }

  const prompt = `You are LEARN OS, a Distinguished Professor and Elite Learning Architect. Your task is to engineer a professional, high-fidelity lesson on: "${topic}" for a student at the "${level}" level.

  CRITICAL INSTRUCTION: Teach this in FULL DETAIL but in an EASY WAY. 
  - Use the "Feynman Technique": Explain complex concepts using simple analogies that anyone can understand.
  - Be technically rigorous (don't skip details) but use crystalline clarity in your language.
  - Break down the "Neural Path": Take the student from 'zero to hero' step-by-step.

  Return ONLY raw JSON (strictly follow this schema):
  {
    "topic": "${topic}",
    "overview": "A warm, inspiring 2-3 sentence executive summary that makes the topic feel accessible and exciting.",
    "sections": [
      {
        "title": "The Big Picture (Simple Analogy)",
        "content": "Explain the core philosophy using a brilliant real-world analogy (e.g. comparing a Database to a library). Make it 'click' instantly (min 150 words).",
        "code": null
      },
      {
        "title": "The Neural Blueprint (Deep Dive)",
        "content": "Now go into FULL DETAIL. Explain the internal mechanics, logic, and data flow. Don't hide the complexity, just explain it simply (min 180 words).",
        "code": "A high-level pseudo-code or visual logic representation"
      },
      {
        "title": "Professional Implementation",
        "content": "How experts build this in the real world. Best practices, patterns, and production strategies (min 180 words).",
        "code": "A clean, production-grade, optimized code example"
      },
      {
        "title": "Strategic Trade-offs (Pitfalls)",
        "content": "What can go wrong? Scalability, performance, and common mistakes. Explain time/space complexity in a way that feels intuitive (min 150 words).",
        "code": "// Commentary on performance optimization"
      },
      {
        "title": "The Mastery Horizon",
        "content": "Advanced applications and future relevance. Where does the student go from here? (min 150 words).",
        "code": null
      }
    ],
    "keyTakeaways": ["A clear, simple fundamental truth 1", "An advanced but easy-to-remember insight 2", "A practical 'pro-tip' 3", "A visionary forward-looking statement 4"],
    "estimatedReadTime": <minutes as number>
  }

  Tone: Authoritative yet deeply encouraging. You are the world's best teacher who makes the hardest topics feel like common sense.`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini teachTopic Error:', error);
    return { topic, overview: `A comprehensive guide to ${topic}.`, sections: [{ title: 'Introduction', content: `${topic} is a key concept to master.`, code: null }], keyTakeaways: ['Study diligently', 'Practice regularly'], estimatedReadTime: 5 };
  }
};

/**
 * Generate a quiz specifically based on lesson content
 */
const generateLessonQuiz = async (topic, lessonContent) => {
  if (USE_MOCK) return mockQuiz(topic);

  const prompt = `Based on this lesson about "${topic}", generate exactly 6 targeted multiple choice questions that test deep understanding — not just surface facts.

  Lesson content: ${JSON.stringify(lessonContent?.sections?.map(s => s.title + ': ' + s.content).join('\n\n'))}

  Return ONLY raw JSON:
  {
    "topic": "${topic}",
    "questions": [
      { "text": "Question?", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why A is correct..." }
    ]
  }`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini lessonQuiz Error:', error);
    return mockQuiz(topic);
  }
};

/**
 * Analyze quiz performance and identify weak areas
 */
const analyzeWeakAreas = async (topic, questions, userAnswers) => {
  const wrongQuestions = questions.filter((q, i) => userAnswers[i] !== q.correctAnswer);
  const score = Math.round(((questions.length - wrongQuestions.length) / questions.length) * 100);

  if (USE_MOCK) {
    return {
      score,
      grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D',
      overallFeedback: `You scored ${score}% on ${topic}. ${score >= 80 ? 'Strong performance!' : 'There are key gaps to address.'}`,
      weakAreas: wrongQuestions.length > 0 ? ['Core concept application', 'Edge case handling'] : [],
      strongAreas: ['Basic understanding', 'Theoretical knowledge'],
      studyPlan: [
        { priority: 'HIGH', action: `Review the "Core Mechanics" section of ${topic}`, timeEstimate: '20 mins' },
        { priority: 'MEDIUM', action: 'Practice 3 coding challenges on this topic', timeEstimate: '45 mins' },
        { priority: 'LOW', action: 'Read real-world case studies', timeEstimate: '15 mins' }
      ],
      nextTopics: [`Advanced ${topic}`, 'Related Patterns', 'System Design with ' + topic]
    };
  }

  const prompt = `You are an expert learning analyst. A student just completed a quiz on "${topic}".

  Score: ${score}%
  Questions they got WRONG: ${JSON.stringify(wrongQuestions.map(q => ({ question: q.text, correctAnswer: q.correctAnswer, explanation: q.explanation })))}
  
  Analyze their performance and create a personalized improvement plan.
  Return ONLY raw JSON:
  {
    "score": ${score},
    "grade": "letter grade",
    "overallFeedback": "2-3 sentence personalized feedback",
    "weakAreas": ["specific concept they struggled with"],
    "strongAreas": ["concepts they demonstrated well"],
    "studyPlan": [
      { "priority": "HIGH/MEDIUM/LOW", "action": "specific study action", "timeEstimate": "X mins" }
    ],
    "nextTopics": ["recommended next topic 1", "topic 2", "topic 3"]
  }`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini analyzeWeakAreas Error:', error);
    return { score, grade: score >= 70 ? 'B' : 'C', overallFeedback: 'Analysis unavailable. Review the topics you missed.', weakAreas: [], strongAreas: [], studyPlan: [], nextTopics: [] };
  }
};

/**
 * Generate a structured assignment based on a topic
 */
const generateStructuredAssignment = async (topic, difficulty = 'professional') => {
  if (USE_MOCK) {
    return {
      title: `${topic} Mastery Challenge`,
      description: `A comprehensive assessment of your ${topic} skills.`,
      subject: topic,
      duration: 45,
      tasks: [
        `Implement a basic ${topic} module.`,
        `Optimize the performance of the ${topic} logic.`,
        `Handle common edge cases in ${topic}.`
      ]
    };
  }

  const prompt = `Generate a highly professional technical assignment for the topic: "${topic}".
    Difficulty Level: ${difficulty}
    
    Return ONLY raw JSON:
    {
      "title": "A sharp, catchy title",
      "description": "A high-level mission brief (2 sentences)",
      "subject": "Main category",
      "duration": <suggested time in minutes between 15 and 90>,
      "tasks": ["Specific Task/Question 1", "Specific Task/Question 2", "Specific Task/Question 3", "Specific Task/Question 4"]
    }`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini Assignment Gen Error:', error);
    return { title: `${topic} Challenge`, description: 'Mission brief unavailable.', subject: topic, duration: 30, tasks: ['Complete the challenge'] };
  }
};

/**
 * Evaluate structured assignment submission
 */
const evaluateStructuredAssignment = async (content, assignment) => {
  if (USE_MOCK) return mockEvaluation(content);

  const prompt = `You are an Elite Technical Reviewer. Evaluate this assignment submission.
    Topic: ${assignment.topic}
    Original Tasks: ${JSON.stringify(assignment.tasks)}
    Submission: "${content}"

    Analyze for:
    1. Technical Accuracy
    2. Task Completion (did they address all tasks?)
    3. Code Quality/Clarity

    Return raw JSON:
    {
      "grade": "A+",
      "score": 0-100,
      "feedback": "...",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "wrongAnswers": [
        { "task": "The specific task from the assignment", "mistake": "What they did wrong", "correctSolution": "The correct way or answer" }
      ],
      "analysis": {
        "technicalAccuracy": 0-100,
        "completeness": 0-100,
        "clarity": 0-100
      }
    }`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini Assignment Eval Error:', error);
    return mockEvaluation(content);
  }
};

module.exports = { 
  chatWithAI, 
  generateQuiz, 
  generateNotes, 
  evaluateAssignment, 
  generateFlashcards, 
  generateAssignmentDraft,
  generateStructuredAssignment,
  evaluateStructuredAssignment,
  teachTopic,
  generateLessonQuiz,
  analyzeWeakAreas,
  cleanJSON,
  model: safeModel,
  proModel: safeProModel
};
