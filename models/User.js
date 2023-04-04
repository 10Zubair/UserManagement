const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String,
    default: null
  },
  pdf: {
    type: String,
    default: null
  },
  cnic: {
    type: String,
    default: null
  },
  mobileNum: {
    type: String,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  token: {
    type: String,
    default: null,
    validate: {
      validator: function(token) {
        if (this.isAdmin) {
          return token !== null;
        }
        return true;
      },
      message: 'Token is required for admin users'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
