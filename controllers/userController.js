const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Update user profile
exports.updateProfile = async (req, res) => {
  const { fullName, mobile, profileImage, password,about,location } = req.body;
  const userId = req.user.id; // Get user ID from JWT token

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    user.profileImage = profileImage || user.profileImage;
    user.about = about || user.about;
    user.location = location || user.location;


    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};