const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all students (filtered by block for wardens)
// @route   GET /api/users/students
// @access  Private (Warden/Admin)
router.get('/students', protect, authorize('warden', 'admin'), async (req, res) => {
  try {
    let query = { role: 'student' };
    if (req.user.role === 'warden' && req.user.hostelId) {
      query.hostelId = req.user.hostelId;
    }
    
    const students = await User.find(query).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all wardens
// @route   GET /api/users/wardens
// @access  Private (Admin)
router.get('/wardens', protect, authorize('admin'), async (req, res) => {
  try {
    const wardens = await User.find({ role: 'warden' }).select('-password').sort({ name: 1 });
    res.json(wardens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
router.patch('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.hostelId = req.body.hostelId || user.hostelId;
      if (user.role !== 'student') {
        user.referenceId = req.body.referenceId || user.referenceId;
      }
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        rollNo: updatedUser.rollNo,
        hostelId: updatedUser.hostelId,
        role: updatedUser.role,
        referenceId: updatedUser.referenceId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Change password
// @route   PATCH /api/users/password
// @access  Private
router.patch('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
