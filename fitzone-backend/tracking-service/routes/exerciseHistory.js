const express = require('express');
const { getExerciseHistory, addExerciseHistory } = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/exercise-history', authMiddleware, getExerciseHistory);
router.post('/exercise-history', authMiddleware, addExerciseHistory);

module.exports = router;
