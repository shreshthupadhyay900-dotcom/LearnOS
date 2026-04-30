const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');

// @desc    Upload a new note
// @route   POST /api/teacher/notes/upload
// @access  Private/Teacher
exports.uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, description, subject } = req.body;

    const note = await Note.create({
      title: title || req.file.originalname,
      description,
      subject,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes (for teachers to manage or students to view)
// @route   GET /api/teacher/notes
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/teacher/notes/:id
// @access  Private/Teacher
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Check ownership
    if (note.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this note' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', note.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
