-- CreateTable
CREATE TABLE "ExerciseHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exercise" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionHistory_pkey" PRIMARY KEY ("id")
);
