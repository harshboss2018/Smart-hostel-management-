const express = require('express');
const router = express.Router();
const Voice = require('../models/Voice');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all voice content
// @route   GET /api/voice
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const content = await Voice.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new voice content
// @route   POST /api/voice
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, content, metadata } = req.body;
    const voice = await Voice.create({
      authorId: req.user._id,
      authorName: req.user.name,
      hostelName: req.user.hostelId || 'General',
      type,
      content,
      metadata
    });
    res.status(201).json(voice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Upvote voice content
// @route   PATCH /api/voice/:id/upvote
// @access  Private
router.patch('/:id/upvote', protect, async (req, res) => {
  try {
    const voice = await Voice.findById(req.params.id);
    if (!voice) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const hasUpvoted = voice.upvotedBy.includes(req.user._id);

    if (hasUpvoted) {
      voice.upvotedBy = voice.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
      voice.upvotes -= 1;
    } else {
      voice.upvotedBy.push(req.user._id);
      voice.upvotes += 1;
    }

    await voice.save();
    res.json(voice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Vote in a poll
// @route   PATCH /api/voice/:id/vote
// @access  Private
router.patch('/:id/vote', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const voice = await Voice.findById(req.params.id);
    if (!voice || voice.type !== 'poll') {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user already voted
    if (voice.voters.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    if (voice.metadata.options[optionIndex]) {
      voice.metadata.options[optionIndex].votes += 1;
      voice.voters.push(req.user._id);
      await voice.save();
      res.json(voice);
    } else {
      res.status(400).json({ message: 'Invalid option index' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Add comment to voice content
// @route   POST /api/voice/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const voice = await Voice.findById(req.params.id);
    if (!voice) {
      return res.status(404).json({ message: 'Content not found' });
    }

    voice.comments.push({
      authorName: req.user.name,
      role: req.user.role,
      content,
      createdAt: new Date()
    });

    await voice.save();
    res.status(201).json(voice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
