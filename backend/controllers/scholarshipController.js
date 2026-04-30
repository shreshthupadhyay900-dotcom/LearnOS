const Scholarship = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const scholarshipService = require('../services/scholarshipService');

exports.getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ deadline: 1 });
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    // In a real app, user profile comes from req.user
    // For this module, we expect it in req.body if not logged in or incomplete
    const userProfile = req.body.profile || req.user.profile;
    const recommendations = await scholarshipService.getRecommendations(userProfile);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const { scholarshipId, profile } = req.body;
    const result = await scholarshipService.checkEligibility(scholarshipId, profile || req.user.profile);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId, documents, notes } = req.body;
    const application = new ScholarshipApplication({
      user: req.user._id,
      scholarship: scholarshipId,
      documents,
      notes,
      status: 'Applied'
    });
    await application.save();
    
    // AI Verification trigger (async)
    scholarshipService.verifyDocuments(application._id, documents);
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationStatus = async (req, res) => {
  try {
    const applications = await ScholarshipApplication.find({ user: req.user._id })
      .populate('scholarship')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });
    res.json(scholarship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
