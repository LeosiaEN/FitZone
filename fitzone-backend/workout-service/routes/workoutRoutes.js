const express = require("express");
const router = express.Router();
const {
  getMyWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getPublicWorkouts,
  getWorkoutById,
} = require("../controllers/workoutController");
const authenticateToken = require("../middleware/authMiddleware");

// Tüm route'lar için authenticateToken middleware'ını uyguluyoruz
router.use(authenticateToken);

// Kendi workoutlarını al
router.get("/my", getMyWorkouts);

// Yeni workout oluştur (egzersizlerle birlikte)
router.post("/", createWorkout);

// Workout güncelle (egzersizleriyle birlikte)
router.put("/:id", updateWorkout);

// Workout sil
router.delete("/:id", deleteWorkout);

// Public workoutları al
router.get("/public/all", getPublicWorkouts);

// Seçili workout'u al (ID ile)
router.get("/:id", getWorkoutById);  // Parametreyi 'id' olarak değiştirdik

module.exports = router;
