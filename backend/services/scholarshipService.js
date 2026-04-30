const Scholarship = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const { model, proModel, cleanJSON } = require('./aiService');

const USE_MOCK = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_key';

/**
 * Get recommended scholarships for a user profile
 */
const getRecommendations = async (userProfile) => {
  // 1. Basic filtering from DB
  const query = {
    incomeLimit: { $gte: userProfile.familyIncome || 0 },
    educationLevel: { $in: [userProfile.educationLevel, 'All'] },
    category: { $in: [userProfile.category, 'All'] },
    ageLimit: { $gte: userProfile.age || 0 },
    $and: [
      { $or: [{ state: userProfile.state }, { state: 'All India' }] },
      { $or: [{ gender: userProfile.gender }, { gender: 'All' }] },
      { $or: [{ courseTypes: { $in: [userProfile.courseInterest, 'Any'] } }, { courseTypes: 'Any' }] }
    ]
  };

  const scholarships = await Scholarship.find(query);

  if (scholarships.length === 0) return [];

  if (USE_MOCK) {
    return scholarships.map(s => ({
      ...s.toObject(),
      matchScore: Math.floor(Math.random() * 40) + 60,
      aiReason: "Matches your basic profile criteria."
    })).sort((a, b) => b.matchScore - a.matchScore);
  }

  // 2. AI Ranking using Gemini
  try {
    const prompt = `Rank the following scholarships for this student profile:
    Profile: ${JSON.stringify(userProfile)}
    Scholarships: ${JSON.stringify(scholarships.map(s => ({ id: s._id, name: s.name, desc: s.description, deadline: s.deadline })))}
    
    Return a JSON array of objects with 'id', 'score' (0-100), and 'reason' (short string).
    Example: [{"id": "...", "score": 95, "reason": "Best match for your category and income."}]
    Return ONLY raw JSON in a "rankings" key.`;

    const result = await model.generateContent(prompt);
    const aiResults = cleanJSON(result.response.text()).rankings || [];
    
    return scholarships.map(s => {
      const aiRes = aiResults.find(r => r.id === s._id.toString());
      return {
        ...s.toObject(),
        matchScore: aiRes ? aiRes.score : 50,
        aiReason: aiRes ? aiRes.reason : "Profile match"
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("AI Ranking Error:", error);
    return scholarships;
  }
};

/**
 * Check eligibility for a specific scholarship
 */
const checkEligibility = async (scholarshipId, userProfile) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) throw new Error('Scholarship not found');

  if (USE_MOCK) {
    return {
      eligible: true,
      reason: "Your academic performance and income fall within the limits for this scholarship.",
      probability: 75
    };
  }

  const prompt = `Check eligibility for this scholarship:
  Scholarship: ${JSON.stringify(scholarship)}
  User Profile: ${JSON.stringify(userProfile)}
  
  Return raw JSON: { "eligible": boolean, "reason": "detailed explanation", "probability": number (0-100) }`;

  try {
    const result = await proModel.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Gemini Eligibility Error:', error);
    return { eligible: true, reason: 'AI analysis bypassed.', probability: 50 };
  }
};

/**
 * Verify documents using AI
 */
const verifyDocuments = async (applicationId, documents) => {
  if (USE_MOCK) {
    return {
      status: "Verified",
      feedback: "All documents look correct.",
      missing: []
    };
  }

  const prompt = `Analyze these document metadata for a scholarship application:
  Documents: ${JSON.stringify(documents)}
  
  Return raw JSON: { "status": "Verified"|"Incomplete"|"Error", "feedback": "string", "missing": ["doc name"] }`;

  try {
    const result = await model.generateContent(prompt);
    const data = cleanJSON(result.response.text());
    
    await ScholarshipApplication.findByIdAndUpdate(applicationId, {
      aiFeedback: data.feedback,
      'documents.verified': data.status === 'Verified'
    });

    return data;
  } catch (error) {
    console.error('Gemini Verification Error:', error);
    return { status: 'Error', feedback: 'AI verification failed.', missing: [] };
  }
};

module.exports = {
  getRecommendations,
  checkEligibility,
  verifyDocuments
};
