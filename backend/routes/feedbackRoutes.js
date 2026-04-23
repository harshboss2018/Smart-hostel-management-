const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const feedbackPopulate = [
  { path: 'studentId', select: 'name rollNo hostelId email' },
  { path: 'createdBy', select: 'name role' },
  { path: 'complaintId', select: 'title status' },
];

// @desc    Get feedback items
// @route   GET /api/feedback
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'warden') {
      query.createdBy = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.json([]);
    }

    const feedback = await Feedback.find(query)
      .populate(feedbackPopulate)
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Push feedback request(s)
// @route   POST /api/feedback/requests
// @access  Private (Warden/Admin)
router.post('/requests', protect, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { studentIds = [], type, title, prompt, targetLabel } = req.body;

    if (!Array.isArray(studentIds) || !studentIds.length) {
      return res.status(400).json({ message: 'Select at least one student.' });
    }

    const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('_id');
    if (!students.length) {
      return res.status(400).json({ message: 'No valid students selected.' });
    }

    const feedback = await Feedback.insertMany(
      students.map((student) => ({
        type: type || 'cleaning',
        title: title || 'Feedback request',
        prompt: prompt || 'Please share your feedback.',
        studentId: student._id,
        createdBy: req.user._id,
        createdByRole: req.user.role,
        audience: students.length > 1 ? 'bulk' : 'single',
        targetLabel: targetLabel || '',
      })),
    );

    const created = await Feedback.find({ _id: { $in: feedback.map((item) => item._id) } })
      .populate(feedbackPopulate)
      .sort({ createdAt: -1 });

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Submit feedback response
// @route   PATCH /api/feedback/:id/submit
// @access  Private (Student)
router.patch('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found.' });
    }

    if (feedback.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to submit this feedback.' });
    }

    feedback.status = 'Submitted';
    feedback.submittedAt = new Date();
    feedback.response = {
      rating: req.body.rating,
      satisfaction: req.body.satisfaction,
      comment: req.body.comment || '',
    };

    await feedback.save();
    await feedback.populate(feedbackPopulate);

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
