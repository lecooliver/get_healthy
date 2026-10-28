-- DropForeignKey
ALTER TABLE "template_exercise_groups" DROP CONSTRAINT "template_exercise_groups_template_workout_id_fkey";

-- DropForeignKey
ALTER TABLE "template_exercises" DROP CONSTRAINT "template_exercises_template_exercise_group_id_fkey";

-- AlterTable
ALTER TABLE "template_exercise_groups" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "name" DROP DEFAULT;

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- AddForeignKey
ALTER TABLE "template_exercise_groups" ADD CONSTRAINT "template_exercise_groups_template_workout_id_fkey" FOREIGN KEY ("template_workout_id") REFERENCES "template_workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_exercise_group_id_fkey" FOREIGN KEY ("template_exercise_group_id") REFERENCES "template_exercise_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
