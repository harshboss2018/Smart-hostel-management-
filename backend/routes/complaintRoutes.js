const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    // If student, only show their complaints
    if (req.user.role === 'student') {
      query = { studentId: req.user._id };
    }
    
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name rollNo hostelId')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student only)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    
    const complaint = await Complaint.create({
      studentId: req.user._id,
      title,
      description,
      category,
      priority
    });
    
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Warden/Admin only)
router.patch('/:id/status', protect, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedAt = Date.now();
      // Calculate resolution time in minutes
      const diffMs = complaint.resolvedAt - complaint.createdAt;
      complaint.resolutionTimeMinutes = Math.floor(diffMs / (1000 * 60));

      const existingFeedback = await Feedback.findOne({
        complaintId: complaint._id,
        type: 'complaint-resolution',
      });

      if (!existingFeedback) {
        await Feedback.create({
          type: 'complaint-resolution',
          title: 'Complaint resolution feedback',
          prompt: `Your complaint "${complaint.title}" was marked resolved. Please confirm whether the issue has been fixed properly.`,
          studentId: complaint.studentId,
          complaintId: complaint._id,
          complaintTitle: complaint.title,
          createdBy: req.user._id,
          createdByRole: 'system',
          targetLabel: complaint.title,
        });
      }
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
