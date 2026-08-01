const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ExerciseHistory = prisma.exerciseHistory;

module.exports = ExerciseHistory;
