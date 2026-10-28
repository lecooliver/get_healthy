const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const ROUTINES = [
  {
    name: 'Push Day',
    type: 'weightlifting',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: [8, 8, 6, 6], weight: 135 },
      { name: 'Overhead Press', sets: 3, reps: [10, 8, 8], weight: 65 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: [12, 10, 10], weight: 40 },
      { name: 'Cable Fly', sets: 3, reps: [15, 15, 12], weight: 25 },
      { name: 'Tricep Pushdown', sets: 3, reps: [12, 12, 10], weight: 40 },
      { name: 'Lateral Raise', sets: 3, reps: [15, 15, 12], weight: 15 }
    ]
  },
  {
    name: 'Pull Day',
    type: 'weightlifting',
    exercises: [
      { name: 'Barbell Row', sets: 4, reps: [10, 8, 8, 6], weight: 135 },
      { name: 'Lat Pulldown', sets: 3, reps: [12, 10, 10], weight: 100 },
      { name: 'Face Pull', sets: 3, reps: [15, 15, 15], weight: 30 },
      { name: 'Barbell Curl', sets: 3, reps: [10, 10, 8], weight: 65 },
      { name: 'Hammer Curl', sets: 3, reps: [12, 10, 10], weight: 25 },
      { name: 'Shrug', sets: 3, reps: [15, 15, 15], weight: 135 }
    ]
  },
  {
    name: 'Leg Day',
    type: 'weightlifting',
    exercises: [
      { name: 'Squat', sets: 4, reps: [10, 8, 6, 6], weight: 185 },
      { name: 'Romanian Deadlift', sets: 3, reps: [10, 10, 8], weight: 135 },
      { name: 'Leg Press', sets: 3, reps: [12, 12, 10], weight: 270 },
      { name: 'Leg Curl', sets: 3, reps: [12, 12, 10], weight: 60 },
      { name: 'Leg Extension', sets: 3, reps: [15, 15, 12], weight: 80 },
      { name: 'Calf Raise', sets: 4, reps: [15, 15, 15, 12], weight: 115 }
    ]
  },
  {
    name: 'Morning Cardio',
    type: 'aerobic',
    exercises: [
      { name: 'Running', sets: 1, reps: [30], weight: 0, duration: 30, cardioType: 'steady' },
      { name: 'Jump Rope', sets: 3, reps: [3], weight: 0, duration: 3 }
    ]
  },
  {
    name: 'HIIT Session',
    type: 'aerobic',
    exercises: [
      { name: 'Warmup', sets: 1, reps: [5], weight: 0, duration: 5 },
      { name: 'Burpee', sets: 8, reps: [20], weight: 0, duration: 20 },
      { name: 'Mountain Climber', sets: 8, reps: [10], weight: 0, duration: 10 },
      { name: 'Cooldown', sets: 1, reps: [5], weight: 0, duration: 5 }
    ]
  },
  {
    name: 'Yoga Flow',
    type: 'flexibility',
    exercises: [
      { name: 'Sun Salutation', sets: 5, reps: [1], weight: 0, duration: 3 },
      { name: 'Downward Dog', sets: 3, reps: [1], weight: 0, duration: 1 },
      { name: 'Warrior Poses', sets: 3, reps: [1], weight: 0, duration: 2 },
      { name: 'Pigeon Pose', sets: 2, reps: [1], weight: 0, duration: 2 },
      { name: 'Child\'s Pose', sets: 2, reps: [1], weight: 0, duration: 2 }
    ]
  }
]

const EXERCISE_TYPES = {
  'Bench Press': 'strength',
  'Overhead Press': 'strength',
  'Incline Dumbbell Press': 'strength',
  'Cable Fly': 'strength',
  'Tricep Pushdown': 'strength',
  'Lateral Raise': 'strength',
  'Barbell Row': 'strength',
  'Lat Pulldown': 'strength',
  'Face Pull': 'strength',
  'Barbell Curl': 'strength',
  'Hammer Curl': 'strength',
  'Shrug': 'strength',
  'Squat': 'strength',
  'Romanian Deadlift': 'strength',
  'Leg Press': 'strength',
  'Leg Curl': 'strength',
  'Leg Extension': 'strength',
  'Calf Raise': 'strength',
  'Running': 'cardio',
  'Jump Rope': 'cardio',
  'Burpee': 'cardio',
  'Mountain Climber': 'cardio',
  'Warmup': 'cardio',
  'Cooldown': 'cardio',
  'Sun Salutation': 'flexibility',
  'Downward Dog': 'flexibility',
  'Warrior Poses': 'flexibility',
  'Pigeon Pose': 'flexibility',
  'Child\'s Pose': 'flexibility'
}

const BODY_MEASUREMENTS = [
  { weight: 185, waist: 34, hips: 38, chest: 42, thigh_l: 22, bicep_l: 13, shoulder_span: 46 },
  { weight: 184, waist: 33.5, hips: 37.5, chest: 42, thigh_l: 22, bicep_l: 13.5 },
  { weight: 183, waist: 33, hips: 37, chest: 42.5, thigh_l: 22.5, bicep_l: 14 },
  { weight: 182, waist: 32.5, hips: 36.5, chest: 43, thigh_l: 23, bicep_l: 14 },
  { weight: 181, waist: 32, hips: 36, chest: 43, thigh_l: 23, bicep_l: 14.5 },
  { weight: 180, waist: 31.5, hips: 35.5, chest: 43.5, thigh_l: 23.5, bicep_l: 15 },
  { weight: 179, waist: 31, hips: 35, chest: 44, thigh_l: 24, bicep_l: 15 },
  { weight: 178, waist: 30.5, hips: 34.5, chest: 44, thigh_l: 24, bicep_l: 15.5 }
]

async function seedDatabase() {
  console.log('Starting database seeding...')

  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.')
      return
    }

    console.log(`Seeding data for user: ${adminUser.email}`)

    const existingRoutines = await prisma.routine.findMany({
      where: { userId: adminUser.id }
    })

    if (existingRoutines.length > 0) {
      console.log('Database already has routines. Skipping seed.')
      console.log(`Found ${existingRoutines.length} existing routines.`)
      return
    }

    const routinePromises = ROUTINES.map(async (routineData, routineIndex) => {
      const routine = await prisma.routine.create({
        data: {
          name: routineData.name,
          type: routineData.type,
          userId: adminUser.id
        }
      })

      const today = new Date()
      const workouts = []

      for (let week = 0; week < 8; week++) {
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
          const workoutDate = new Date(today)
          workoutDate.setDate(today.getDate() - (week * 7 + dayOffset * 2 + Math.floor(Math.random() * 2)))
          
          const isCompleted = Math.random() > 0.1
          const progressMultiplier = 1 - (week * 0.02)

          const workout = await prisma.workout.create({
            data: {
              routineId: routine.id,
              name: `${routineData.name} - ${workoutDate.toLocaleDateString()}`,
              scheduledDate: workoutDate,
              completedAt: isCompleted ? workoutDate : null,
              order: week * 3 + dayOffset + 1,
              archived: week > 6
            }
          })

          const exercisePromises = routineData.exercises.map(async (exerciseData, exerciseIndex) => {
            const exercise = await prisma.exercise.create({
              data: {
                workoutId: workout.id,
                name: exerciseData.name,
                type: EXERCISE_TYPES[exerciseData.name] || 'strength',
                order: exerciseIndex + 1
              }
            })

            if (EXERCISE_TYPES[exerciseData.name] === 'strength') {
              for (let setIndex = 0; setIndex < exerciseData.sets; setIndex++) {
                const reps = exerciseData.reps[setIndex]
                const baseWeight = exerciseData.weight * progressMultiplier
                const weightVariation = (Math.random() - 0.5) * 10
                const weight = Math.round((baseWeight + weightVariation) / 5) * 5
                const rpe = Math.min(10, 6 + Math.floor(Math.random() * 4))
                const completed = isCompleted && Math.random() > 0.05

                await prisma.exerciseSet.create({
                  data: {
                    exerciseId: exercise.id,
                    setNumber: setIndex + 1,
                    reps,
                    weight: Math.max(0, weight),
                    rpe: isCompleted ? rpe : null,
                    completed
                  }
                })
              }
            } else if (EXERCISE_TYPES[exerciseData.name] === 'cardio') {
              const duration = exerciseData.duration || 30
              const distance = exerciseData.name === 'Running' ? Math.round(duration * 0.15 * 10) / 10 : null
              const heartRate = 120 + Math.floor(Math.random() * 40)
              const calories = Math.round(duration * 8 * progressMultiplier)

              await prisma.aerobicLog.create({
                data: {
                  exerciseId: exercise.id,
                  durationMinutes: duration,
                  distance: distance,
                  distanceUnit: 'mi',
                  heartRate,
                  calories
                }
              })
            }
          })

          await Promise.all(exercisePromises)
          workouts.push(workout)
        }
      }

      console.log(`Created routine: ${routineData.name} with ${workouts.length} workouts`)
      return routine
    })

    await Promise.all(routinePromises)

    console.log('\nSeeding body measurements...')
    const measurementPromises = BODY_MEASUREMENTS.map(async (measurement, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (BODY_MEASUREMENTS.length - index - 1) * 7)

      return prisma.bodyMeasurement.create({
        data: {
          userId: adminUser.id,
          date,
          weight: measurement.weight,
          waist: measurement.waist,
          hips: measurement.hips,
          chest: measurement.chest,
          thigh_l: measurement.thigh_l,
          bicep_l: measurement.bicep_l,
          shoulder_span: measurement.shoulder_span || 46,
          neck: 15 + Math.random() * 0.5,
          calf_l: 14 + Math.random(),
          bodyFatPercentage: 18 + Math.random() * 4
        }
      })
    })

    await Promise.all(measurementPromises)
    console.log(`Created ${BODY_MEASUREMENTS.length} body measurements`)

    console.log('\nDatabase seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
