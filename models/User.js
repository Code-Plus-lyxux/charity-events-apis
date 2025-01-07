const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  about: { type: String, default: '' },
  location: { type: String, required: true },
  mobile: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
