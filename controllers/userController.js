const User = require("../models/User");

// Update user profile
exports.updateProfile = async (req, res) => {
    const { firstName, lastName, mobile, profileImage } = req.body;
    const userId = req.user.id; // Get user ID from JWT token

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.mobile = mobile || user.mobile;
        user.profileImage = profileImage || user.profileImage;

        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("eventsAttended")
            .populate("eventsCreated")
            .populate("eventsAttending");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
