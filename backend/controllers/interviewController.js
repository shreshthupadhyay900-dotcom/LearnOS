const Interview = require('../models/Interview');
const { model, proModel, cleanJSON } = require('../services/aiService');

// ── Company-specific interviewer personalities ───────────────────────────────
const COMPANY_STYLES = {
  Google: {
    persona: 'a Senior Staff Software Engineer at Google',
    focus: 'algorithmic thinking, Big-O complexity analysis, clean code principles, and scalable system design. Google interviewers are rigorous about correctness and edge cases.',
    technicalBias: 'algorithms, data structures, distributed systems',
  },
  Amazon: {
    persona: 'a Principal Engineer at Amazon',
    focus: "Amazon's Leadership Principles (Customer Obsession, Ownership, Bias for Action). Expect behavioral STAR-format questions alongside scalability challenges.",
    technicalBias: 'distributed systems, microservices, fault tolerance',
  },
  Meta: {
    persona: 'a Staff Engineer at Meta',
    focus: 'product-oriented engineering, high-scale systems (billions of users), and execution speed. Meta values strong opinions on product decisions.',
    technicalBias: 'graph algorithms, feed ranking systems, real-time data',
  },
  Microsoft: {
    persona: 'a Senior Engineer at Microsoft',
    focus: 'collaboration, pragmatic engineering, and strong communication. Microsoft values growth mindset and cross-team impact.',
    technicalBias: 'object-oriented design, cloud architecture, APIs',
  },
  Netflix: {
    persona: 'a Senior Engineer at Netflix',
    focus: "Netflix's culture of freedom and responsibility. They expect senior-level ownership, strong opinions on trade-offs, and deep expertise.",
    technicalBias: 'streaming systems, resilience engineering, microservices',
  },
};

// ── Phase definitions ─────────────────────────────────────────────────────────
const PHASE_PLAN = {
  intro: { questions: 1, next: 'technical', label: 'Introduction' },
  technical: { questions: 4, next: 'behavioral', label: 'Technical Deep-Dive' },
  behavioral: { questions: 3, next: 'system_design', label: 'Behavioral' },
  system_design: { questions: 1, next: 'closing', label: 'System Design' },
  closing: { questions: 1, next: null, label: 'Closing' },
};

// ── Difficulty modifiers ──────────────────────────────────────────────────────
const DIFFICULTY_LABELS = {
  junior: '0-2 years experience, entry-level complexity',
  mid: '3-5 years experience, intermediate complexity',
  senior: '6+ years experience, senior/staff complexity, expect deep system design',
};

// ── Score a candidate answer ──────────────────────────────────────────────────
async function scoreAnswer(question, answer, domain) {
  const prompt = `You are evaluating a technical interview answer.
Question asked: "${question}"
Candidate's answer: "${answer}"
Domain: ${domain}

Score this answer objectively and identify any technical mistakes or missed edge cases.
Return ONLY raw JSON (no markdown):
{
  "score": 0-100,
  "technicalAccuracy": 0-100,
  "clarity": 0-100,
  "depth": 0-100,
  "mistakeFound": "Brief description of any technical error or null if correct",
  "feedbackForCandidate": "A professional hint or correction to give them in the next response"
}`;
  try {
    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch {
    return { score: 70, technicalAccuracy: 70, clarity: 70, depth: 70 };
  }
}

// ── Determine next phase based on question count ──────────────────────────────
function advancePhase(interview) {
  const plan = PHASE_PLAN[interview.phase];
  if (!plan) return interview.phase;

  // Count questions asked in current phase
  const phaseQuestions = interview.transcript.filter(
    t => t.role === 'interviewer' && t.phase === interview.phase
  ).length;

  if (phaseQuestions >= plan.questions) {
    return plan.next || interview.phase;
  }
  return interview.phase;
}

// ── Build the interviewer prompt ──────────────────────────────────────────────
function buildPrompt(interview) {
  const style = COMPANY_STYLES[interview.company] || COMPANY_STYLES.Google;
  const diffLabel = DIFFICULTY_LABELS[interview.difficulty] || DIFFICULTY_LABELS.mid;
  const plan = PHASE_PLAN[interview.phase];
  const totalQ = interview.questionCount;

  const phaseInstructions = {
    intro: `This is the INTRODUCTION phase. Ask the candidate to introduce themselves and their background related to ${interview.domain}. Be warm but professional.`,
    technical: `This is the TECHNICAL DEEP-DIVE phase. Ask ONE specific, challenging technical question about ${interview.domain}. 
      - For ${interview.company}: focus on ${style.technicalBias}.
      - Difficulty level: ${diffLabel}
      - Do NOT repeat previous topics. Build on what has been discussed.
      - If the previous answer was weak, probe deeper on the same concept.`,
    behavioral: `This is the BEHAVIORAL phase. Ask ONE behavioral question using the STAR method framework.
      For ${interview.company}: ${style.focus}
      Example: "Tell me about a time when..." or "Describe a situation where..."`,
    system_design: `This is the SYSTEM DESIGN phase. Ask ONE system design question appropriate for ${interview.domain} at ${interview.company}.
      Difficulty: ${diffLabel}. Expect the candidate to think about scalability, fault tolerance, and trade-offs.`,
    closing: `This is the CLOSING phase. Wrap up the interview professionally. Say exactly: 
      "Thank you for your time today. That concludes our interview. I'll now generate your comprehensive performance report."
      Do NOT ask another question.`,
  };

  return `You are ${style.persona} conducting a structured technical interview for a ${interview.domain} role.
Your interview style: ${style.focus}
Current Phase: ${interview.phase.toUpperCase()}
Progress: Question ${totalQ + 1} of ${interview.totalQuestions}

[INSTRUCTIONS]:
1. ${phaseInstructions[interview.phase]}
2. Be rigorous but professional. Use sophisticated terminology.
3. If the candidate made a mistake in their previous answer (see history), briefly point it out and provide a high-level correction before moving to the next question.
4. If they performed well, acknowledge it with a brief professional comment.
5. NEVER ask more than one question at a time.
6. If the candidate is struggling, give them a subtle hint or simplify the next question.
7. Stay in character as ${style.persona}.

[REDACTED RULES]: No hints or answers should be given unless they are absolutely stuck. Focus on evaluation.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc  Start/Continue an interview
// @route POST /api/interviews/chat
// ─────────────────────────────────────────────────────────────────────────────
const interviewChat = async (req, res, next) => {
  try {
    const { message, domain, company, difficulty, interviewId } = req.body;
    const userId = req.user._id;

    let interview;

    // ── New interview ──────────────────────────────────────────────────────
    if (!interviewId) {
      const style = COMPANY_STYLES[company] || COMPANY_STYLES.Google;
      const opening = `Welcome! I'm ${style.persona} and I'll be conducting your ${domain} interview today. This will be a structured session covering technical concepts, behavioral questions, and system design — tailored to ${company}'s engineering standards.\n\nLet's begin. Could you start by introducing yourself and walking me through your background in ${domain}?`;

      interview = await Interview.create({
        userId,
        domain: domain || 'General Technical',
        company: company || 'Google',
        difficulty: difficulty || 'mid',
        phase: 'intro',
        questionCount: 1,
        totalQuestions: 10,
        transcript: [{ role: 'interviewer', content: opening, phase: 'intro' }],
      });

      return res.json({
        success: true,
        reply: opening,
        interviewId: interview._id,
        phase: 'intro',
        questionCount: 1,
        totalQuestions: 10,
        status: 'ongoing',
      });
    }

    // ── Continue existing interview ────────────────────────────────────────
    interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    if (interview.status === 'completed') {
      return res.json({ success: true, reply: 'This interview has already been completed.', status: 'completed', interviewId: interview._id });
    }

    // Score the candidate's answer against the last interviewer question
    const lastQuestion = [...interview.transcript].reverse().find(t => t.role === 'interviewer');
    let answerScore = null;
    if (lastQuestion && message) {
      answerScore = await scoreAnswer(lastQuestion.content, message, interview.domain);
      interview.answerScores.push({
        questionIndex: interview.questionCount,
        score: answerScore.score,
        technicalAccuracy: answerScore.technicalAccuracy,
        clarity: answerScore.clarity,
        depth: answerScore.depth
      });

      // Track mistakes
      if (answerScore.mistakeFound) {
        interview.mistakes.push({
          question: lastQuestion.content,
          mistake: answerScore.mistakeFound,
          feedback: answerScore.feedbackForCandidate,
          isResolved: false
        });
      } else {
        // Check if they resolved a previous mistake
        const openMistake = interview.mistakes.find(m => !m.isResolved && m.question === lastQuestion.content);
        if (openMistake) openMistake.isResolved = true;
      }
    }

    // Add candidate message
    interview.transcript.push({ role: 'candidate', content: message, phase: interview.phase });

    // Advance phase if needed
    const newPhase = advancePhase(interview);
    if (newPhase !== interview.phase) {
      interview.phase = newPhase;
    }

    // Build chat history for Gemini
    const chatHistory = interview.transcript.map(t => ({
      role: t.role === 'interviewer' ? 'model' : 'user',
      parts: [{ text: t.content }],
    }));

    const chat = proModel.startChat({ history: chatHistory.slice(0, -1) });
    const prompt = buildPrompt(interview);
    const finalPrompt = `[INTERVIEWER CONTEXT]: You are responding to the candidate's latest answer. 
      Instructions: ${prompt}
      
      Latest Answer to evaluate: "${message}"`;

    const result = await chat.sendMessage(finalPrompt);
    const reply = result.response.text().trim();

    interview.transcript.push({ role: 'interviewer', content: reply, phase: interview.phase });
    interview.questionCount += 1;

    // Detect interview completion
    const isCompleted =
      reply.toLowerCase().includes('concludes our interview') ||
      reply.toLowerCase().includes('generate your comprehensive performance report') ||
      interview.questionCount >= interview.totalQuestions + 1;

    if (isCompleted) {
      interview.status = 'completed';
    }

    await interview.save();

    res.json({
      success: true,
      reply,
      interviewId: interview._id,
      phase: interview.phase,
      questionCount: interview.questionCount,
      totalQuestions: interview.totalQuestions,
      status: interview.status,
      answerScore,
    });
  } catch (error) {
    console.error('Interview Chat Error:', error);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc  Generate comprehensive interview feedback
// @route POST /api/interviews/:id/feedback
// ─────────────────────────────────────────────────────────────────────────────
const generateFeedback = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const transcriptText = interview.transcript
      .map(t => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n');

    const avgScore = interview.answerScores.length
      ? Math.round(interview.answerScores.reduce((a, s) => a + s.score, 0) / interview.answerScores.length)
      : null;

    const style = COMPANY_STYLES[interview.company] || COMPANY_STYLES.Google;

    const prompt = `You are ${style.persona} writing a detailed post-interview evaluation report.

Interview Details:
- Company: ${interview.company}
- Domain: ${interview.domain}
- Difficulty Level: ${interview.difficulty}
- Number of Exchanges: ${interview.questionCount}

Full Transcript:
${transcriptText}

Analyze the candidate's performance holistically and return ONLY raw JSON (no markdown fences):
{
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "problemSolvingScore": 0-100,
  "confidence": 0-100,
  "clarity": 0-100,
  "pros": [
    "Specific strength 1 with example from transcript",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "cons": [
    "Specific weakness 1 with suggestion to improve",
    "Specific weakness 2",
    "Specific weakness 3"
  ],
  "knowledgeGaps": ["Topic 1", "Topic 2", "Topic 3"],
  "mistakesRecap": [
    { "question": "Question asked", "mistake": "What they got wrong", "isResolved": true/false }
  ],
  "overallFeedback": "3-4 sentence executive summary of performance",
  "hiringRecommendation": "Strong Hire | Hire | Borderline | No Hire"
}`;

    const result = await proModel.generateContent(prompt + `\n\n[MISTAKE LOG]: ${JSON.stringify(interview.mistakes)}`);
    const feedback = cleanJSON(result.response.text());

    // Override overallScore if we have real scored data
    if (avgScore !== null) {
      feedback.overallScore = Math.round((feedback.overallScore + avgScore) / 2);
    }

    interview.feedback = feedback;
    interview.status = 'completed';
    await interview.save();

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback Generation Error:', error);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc  Get interview history for user
// @route GET /api/interviews/history
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('domain company difficulty status questionCount feedback.overallScore createdAt');
    res.json({ success: true, interviews });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc  Get a specific interview
// @route GET /api/interviews/:id
// ─────────────────────────────────────────────────────────────────────────────
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, interview });
  } catch (error) { next(error); }
};

module.exports = { interviewChat, generateFeedback, getHistory, getInterview };
