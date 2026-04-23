const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'hostelhub_fallback_secret', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (for demo purposes)
const registerUser = async (req, res) => {
  try {
    const { email, password, role, referenceId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      referenceId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { identifier, password, role } = req.body;
  
  console.log('--- LOGIN API DEBUG START ---');
  console.log(`[API] Payload Identifier: ${identifier}`);

  try {
    // Audit Search Logic
    const query = {
      $or: [
        { email: identifier },
        { rollNo: identifier },
        { referenceId: identifier }
      ]
    };
    if (role) {
      query.role = role;
    }
    const user = await User.findOne(query);

    if (!user) {
      console.log('❌ [API] Result: USER NOT FOUND IN DB');
      return res.status(401).json({ message: 'Account not recognized.' });
    }

    // Students authenticate with their stored credentials (registration/roll number + password).

    console.log(`✅ [API] Result: USER FOUND (${user.role})`);

    // Audit Password Logic
    const isMatch = await user.matchPassword(password);
    console.log(`🔑 [API] Password Comparison: ${isMatch ? 'MATCHED' : 'FAILED'}`);

    if (isMatch) {
      const token = generateToken(user._id, user.role);
      console.log('🎫 [API] JWT Generated Successfully');
      console.log('--- LOGIN API DEBUG END ---');

      return res.json({
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNo: user.rollNo,
          hostelId: user.hostelId
        }
      });
    }

    res.status(401).json({ message: 'Invalid password.' });
  } catch (error) {
    console.error(`💥 [API] FATAL ERROR: ${error.message}`);
    res.status(500).json({ message: 'Backend internal error.' });
  }
};

module.exports = {
  registerUser,
  loginUser
};
