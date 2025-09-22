const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,15}$/.test(v);
      },
      message: 'Mobile number must be 10-15 digits'
    }
  },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'nurse', 'pharmacist'],
    default: 'patient'
  },
  profile: {
    specialization: {
      type: String,
      required: function() { return this.role === 'doctor'; }
    },
    experience: {
      type: Number,
      min: 0,
      required: function() { return this.role === 'doctor'; }
    },
    medicalHistory: {
      type: String,
      required: function() { return this.role === 'patient'; }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
