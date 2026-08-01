const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NutritionHistory = prisma.nutritionHistory;

module.exports = NutritionHistory;
