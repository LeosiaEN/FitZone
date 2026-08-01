const prisma = require('@prisma/client').PrismaClient();
const prismaClient = new prisma();

const getNutritionHistory = async (req, res) => {
  const { userId } = req;
  try {
    const nutrition = await prismaClient.nutritionHistory.findMany({
      where: { userId },
    });
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nutrition history', error });
  }
};

const addNutritionHistory = async (req, res) => {
  const { userId } = req;
  const { mealType, calories, protein, carbs, fat } = req.body;

  try {
    const newNutrition = await prismaClient.nutritionHistory.create({
      data: {
        userId,
        mealType,
        calories,
        protein,
        carbs,
        fat,
      },
    });
    res.json(newNutrition);
  } catch (error) {
    res.status(500).json({ message: 'Error adding nutrition history', error });
  }
};

module.exports = { getNutritionHistory, addNutritionHistory };
