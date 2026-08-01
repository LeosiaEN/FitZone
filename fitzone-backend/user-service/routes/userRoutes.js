const express = require("express");
const router = express.Router(); // Use express.Router()
const { getMe, createOrUpdateProfile, getUserProfileById } = require("../controllers/userController"); // Import getUserProfileById
const authenticate = require("../middleware/authMiddleware"); // Assuming this is your auth middleware

router.get("/me", authenticate, getMe);
// Note: Your route is /create, but the controller comment says /profile.
// Make sure your routes match your intended endpoints.
router.post("/profile", authenticate, createOrUpdateProfile); // Using /profile as per controller comments

// New route to get a user profile by ID
// This route should match the endpoint structure expected by your frontend
router.get("/profile/:userId", authenticate, getUserProfileById); // Add the new route

module.exports = router;