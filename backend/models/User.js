const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false // Optional for initial setup
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  rollNo: {
    type: String, // Roll number for students
    required: false,
    unique: true,
    sparse: true
  },
  referenceId: {
    type: String, // Legacy support for Emp IDs
    required: false,
    sparse: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'warden', 'student'],
    required: true
  },
  hostelId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
