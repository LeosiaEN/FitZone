const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc  Get user profile information for the logged-in user
// @route GET /api/users/me
// @access Private (requires authentication)
const getMe = async (req, res) => {
    // The user ID is typically attached to the request object by an authentication middleware
    const userId = req.user.userId;

    // Basic check to ensure userId is available (should be guaranteed by auth middleware)
    if (!userId) {
        // This case should ideally not happen if auth middleware works correctly
        return res.status(400).json({ error: 'User ID is missing from request after authentication' });
    }

    try {
        // Find the unique user profile based on the userId
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            // You might want to select specific fields here as well,
            // but for the logged-in user, returning the full profile is common.
        });

        // If no profile is found for the authenticated user ID
        if (!profile) {
            // This could mean the user exists but hasn't created a profile yet
            return res.status(404).json({ error: 'Profile not found for this user' });
        }

        // Return the found profile
        return res.json(profile);
    } catch (error) {
        // Log the error for debugging purposes
        console.error(`Error fetching profile for userId: ${userId}`, error);
        // Send a generic server error response
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// @desc  Create or update user profile information for the logged-in user
// @route POST /api/users/profile (for create) or PUT /api/users/profile (for update)
// @access Private (requires authentication)
const createOrUpdateProfile = async (req, res) => {
    // Get the user ID from the authenticated request
    const userId = req.user.userId;
    // Destructure profile data from the request body
    const { name, age, height, weight, gender } = req.body;

    // Ensure userId is present
    if (!userId) {
         // This case should ideally not happen if auth middleware works correctly
        return res.status(400).json({ error: 'User ID is missing from request after authentication' });
    }

    // Basic validation for required fields in the request body
    if (!name || age === undefined || height === undefined || weight === undefined || gender === undefined) {
        return res.status(400).json({ error: 'Missing required profile data (name, age, height, weight, gender)' });
    }

    try {
        // Check if a profile already exists for this user ID
        const existing = await prisma.userProfile.findUnique({ where: { userId } });

        if (existing) {
            // If a profile exists, update it
            const updated = await prisma.userProfile.update({
                where: { userId }, // Find the profile by userId
                data: { name, age, height, weight, gender }, // Data to update
            });
            console.log(`Profile updated for userId: ${userId}`); // Log the action
            return res.json(updated); // Return the updated profile
        }

        // If no profile exists, create a new one
        const created = await prisma.userProfile.create({
            data: { userId, name, age, height, weight, gender }, // Data to create
        });

        console.log(`Profile created for userId: ${userId}`); // Log the action
        // Return the created profile with a 201 Created status code
        return res.status(201).json(created);
    } catch (error) {
        // Log detailed error information
        console.error(`Error saving profile for userId: ${userId}`, error);
        // Send a generic server error response
        return res.status(500).json({ error: 'Profile could not be saved' });
    }
};

// @desc  Get public user profile information by User ID
// @route GET /api/users/profile/:userId
// @access Private (requires authentication, but gets *other* user's public data)
// IMPORTANT: Only return public information here!
const getUserProfileById = async (req, res) => {
    // Get the user ID from the URL parameters
    // URL parameters are always strings.
    let { userId } = req.params;

    // Attempt to convert userId to a number if your database stores it as a number.
    // Use Number(), parseInt(), or parseFloat(). 'number()' is not a standard function.
    // If userId is stored as a string in the DB, you might not need this conversion.
    // Check your Prisma schema and database type for userId.
    // If userId is a string (like a UUID), remove this conversion line.
    // If userId is an integer ID, use Number() or parseInt().
    // Example using Number():
    userId = Number(userId);

    // Ensure userId parameter is provided and is a valid number after conversion (if applicable)
    // If userId is a string in DB, remove the Number() conversion and this check.
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid or missing User ID in request parameters' });
    }

    try {
        // Find the unique user profile based on the provided userId
        const profile = await prisma.userProfile.findUnique({
            where: { userId: userId }, // Match the database userId field with the parameter userId
            // SECURITY NOTE: ONLY select fields that are safe to share publicly.
            // Do NOT include sensitive information like age, height, weight, gender, etc.
            select: {
                userId: true, // Include userId to identify the profile
                name: true, // Include the user's name
                // Add any other fields from your UserProfile model that are public
                // e.g., avatarUrl: true, bio: true, etc.
            },
        });

        // If no profile is found for the given userId
        if (!profile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Return the found profile (containing only selected public fields)
        console.log(`Fetched public profile for userId:`, profile); // Log the action
        return res.json(profile);
    } catch (error) {
        // Log the detailed error for debugging
        console.error(`Error fetching user profile by ID (${userId}):`, error);
        // Send a generic server error response
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

// Export all controller functions
module.exports = {
    getMe,
    createOrUpdateProfile,
    getUserProfileById, // Export the new function
};
