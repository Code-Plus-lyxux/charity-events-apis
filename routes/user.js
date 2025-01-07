const express = require("express");
const router = express.Router();
const { updateProfile, getUserById } = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

// Update user profile
router.put("/profile", authenticate, updateProfile);

router.get("/:id", authenticate, getUserById);

module.exports = router;
