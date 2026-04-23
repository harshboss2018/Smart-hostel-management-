const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all leave applications (filtered by role)
// @route   GET /api/leave
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { studentId: req.user._id };
    }
    
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Apply for leave
// @route   POST /api/leave
// @access  Private (Student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { reason, startDate, endDate, type } = req.body;
    
    const leave = await Leave.create({
      studentId: req.user._id,
      studentName: req.user.name,
      rollNo: req.user.rollNo,
      reason,
      startDate,
      endDate,
      type
    });
    
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update leave status (Approve/Reject)
// @route   PATCH /api/leave/:id/status
// @access  Private (Warden/Admin)
router.patch('/:id/status', protect, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }
    
    leave.status = status;
    leave.wardenRemarks = remarks;
    if (status === 'Approved') {
      leave.approvedAt = Date.now();
    }
    
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
