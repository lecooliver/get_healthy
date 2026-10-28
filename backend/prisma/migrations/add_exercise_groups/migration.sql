-- Create template_exercise_groups table
CREATE TABLE "template_exercise_groups" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "template_workout_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Main Exercises',
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "template_exercise_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "template_exercise_groups_template_workout_id_fkey" FOREIGN KEY ("template_workout_id") REFERENCES "template_workouts"("id") ON DELETE CASCADE
);

-- Create index
CREATE INDEX "template_exercise_groups_template_workout_id_idx" ON "template_exercise_groups"("template_workout_id");

-- Add template_exercise_group_id column to template_exercises
ALTER TABLE "template_exercises" ADD COLUMN "template_exercise_group_id" TEXT;

-- For each workout, create a default exercise group and assign existing exercises to it
DO $$
DECLARE
    workout_rec RECORD;
    new_group_id TEXT;
BEGIN
    FOR workout_rec IN SELECT id FROM "template_workouts" LOOP
        -- Create a default exercise group for this workout
        new_group_id := gen_random_uuid();
        INSERT INTO "template_exercise_groups" (id, template_workout_id, name, "order")
        VALUES (new_group_id, workout_rec.id, 'Main Exercises', 1);
        
        -- Update existing exercises to belong to this group
        UPDATE "template_exercises"
        SET "template_exercise_group_id" = new_group_id
        WHERE "template_workout_id" = workout_rec.id;
    END LOOP;
END $$;

-- Make template_exercise_group_id required
ALTER TABLE "template_exercises" ALTER COLUMN "template_exercise_group_id" SET NOT NULL;

-- Drop old foreign key and column
ALTER TABLE "template_exercises" DROP CONSTRAINT IF EXISTS "template_exercises_template_workout_id_fkey";
ALTER TABLE "template_exercises" DROP COLUMN IF EXISTS "template_workout_id";

-- Add new foreign key
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_exercise_group_id_fkey" 
    FOREIGN KEY ("template_exercise_group_id") REFERENCES "template_exercise_groups"("id") ON DELETE CASCADE;

-- Create index
CREATE INDEX "template_exercises_template_exercise_group_id_idx" ON "template_exercises"("template_exercise_group_id");
