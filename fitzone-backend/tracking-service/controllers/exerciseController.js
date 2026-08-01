const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==============================================================================
// EXERCISE HISTORY CONTROLLER
// ==============================================================================

const getExerciseHistory = async (req, res) => {
  const { userId } = req;
  try {
    const exercises = await prisma.exerciseHistory.findMany({
      where: { userId },
    });
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({
      message: 'Error fetching exercise history',
      error: error.message || 'An unknown error occurred'
    });
  }
};

const addExerciseHistory = async (req, res) => {
  const { userId } = req;
  const { exercises } = req.body;

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ message: 'Invalid or empty exercises array in request body' });
  }

  const exerciseData = exercises[0];

  if (!exerciseData || !exerciseData.exercise || exerciseData.sets === undefined || exerciseData.reps === undefined) {
    return res.status(400).json({ message: 'Missing required exercise data fields (exercise, sets, reps)' });
  }

  try {
    const newExercise = await prisma.exerciseHistory.create({
      data: {
        userId,
        exercise: exerciseData.exercise,
        sets: exerciseData.sets,
        reps: exerciseData.reps
      },
    });
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error adding exercise history:', error);
    res.status(500).json({
      message: 'Error adding exercise history',
      error: error.message || 'An unknown error occurred'
    });
  }
};

module.exports = { getExerciseHistory, addExerciseHistory };
