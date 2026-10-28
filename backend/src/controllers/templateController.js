const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const PREBUILT_TEMPLATES = [
  {
    name: 'StrongLifts 5x5',
    description: 'Classic strength training program with compound movements',
    type: 'weightlifting',
    goals: ['strength'],
    difficulty: 'intermediate',
    equipment: ['barbell', 'squat_rack', 'bench'],
    workouts: [
      {
        name: 'Workout A',
        exerciseGroups: [
          {
            name: 'Main Lifts',
            exercises: [
              { name: 'Squat', type: 'strength', defaultSets: 5, defaultReps: 5, restSeconds: 180 },
              { name: 'Bench Press', type: 'strength', defaultSets: 5, defaultReps: 5, restSeconds: 180 },
              { name: 'Barbell Row', type: 'strength', defaultSets: 5, defaultReps: 5, restSeconds: 180 }
            ]
          }
        ]
      },
      {
        name: 'Workout B',
        exerciseGroups: [
          {
            name: 'Main Lifts',
            exercises: [
              { name: 'Squat', type: 'strength', defaultSets: 5, defaultReps: 5, restSeconds: 180 },
              { name: 'Overhead Press', type: 'strength', defaultSets: 5, defaultReps: 5, restSeconds: 180 },
              { name: 'Deadlift', type: 'strength', defaultSets: 1, defaultReps: 5, restSeconds: 180 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Push/Pull/Legs',
    description: '6-day split targeting each muscle group twice per week',
    type: 'weightlifting',
    goals: ['strength', 'hypertrophy'],
    difficulty: 'intermediate',
    equipment: ['barbell', 'dumbbells', 'cable_machine'],
    workouts: [
      {
        name: 'Push Day',
        exerciseGroups: [
          {
            name: 'Chest',
            exercises: [
              { name: 'Bench Press', type: 'strength', defaultSets: 4, defaultReps: 8, restSeconds: 90 },
              { name: 'Incline Dumbbell Press', type: 'strength', defaultSets: 3, defaultReps: 10, restSeconds: 60 }
            ]
          },
          {
            name: 'Shoulders',
            exercises: [
              { name: 'Overhead Press', type: 'strength', defaultSets: 4, defaultReps: 8, restSeconds: 90 }
            ]
          },
          {
            name: 'Triceps',
            exercises: [
              { name: 'Tricep Pushdown', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 60 }
            ]
          }
        ]
      },
      {
        name: 'Pull Day',
        exerciseGroups: [
          {
            name: 'Back',
            exercises: [
              { name: 'Barbell Row', type: 'strength', defaultSets: 4, defaultReps: 8, restSeconds: 90 },
              { name: 'Lat Pulldown', type: 'strength', defaultSets: 4, defaultReps: 10, restSeconds: 60 }
            ]
          },
          {
            name: 'Rear Delts',
            exercises: [
              { name: 'Face Pull', type: 'strength', defaultSets: 3, defaultReps: 15, restSeconds: 60 }
            ]
          },
          {
            name: 'Biceps',
            exercises: [
              { name: 'Barbell Curl', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 60 }
            ]
          }
        ]
      },
      {
        name: 'Leg Day',
        exerciseGroups: [
          {
            name: 'Quads',
            exercises: [
              { name: 'Squat', type: 'strength', defaultSets: 4, defaultReps: 8, restSeconds: 120 },
              { name: 'Leg Press', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 90 }
            ]
          },
          {
            name: 'Hamstrings',
            exercises: [
              { name: 'Romanian Deadlift', type: 'strength', defaultSets: 4, defaultReps: 10, restSeconds: 90 }
            ]
          },
          {
            name: 'Calves',
            exercises: [
              { name: 'Calf Raise', type: 'strength', defaultSets: 4, defaultReps: 15, restSeconds: 60 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Couch to 5K',
    description: '9-week progressive running program for beginners',
    type: 'aerobic',
    goals: ['endurance', 'weight_loss'],
    difficulty: 'beginner',
    equipment: ['running_shoes'],
    workouts: [
      {
        name: 'Week 1',
        exerciseGroups: [
          {
            name: 'Intervals',
            exercises: [
              { name: 'Run Intervals', type: 'cardio', durationMinutes: 20 }
            ]
          }
        ]
      },
      {
        name: 'Week 5',
        exerciseGroups: [
          {
            name: 'Continuous Run',
            exercises: [
              { name: 'Continuous Run', type: 'cardio', durationMinutes: 30 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'HIIT 20-min',
    description: 'High-intensity interval training for maximum calorie burn',
    type: 'aerobic',
    goals: ['endurance', 'weight_loss'],
    difficulty: 'advanced',
    equipment: ['none'],
    workouts: [
      {
        name: 'HIIT Session',
        exerciseGroups: [
          {
            name: 'Warmup',
            exercises: [
              { name: 'Warmup', type: 'cardio', durationMinutes: 4 }
            ]
          },
          {
            name: 'Sprint Intervals',
            exercises: [
              { name: 'Sprint Intervals', type: 'cardio', durationMinutes: 16 }
            ]
          },
          {
            name: 'Cooldown',
            exercises: [
              { name: 'Cooldown', type: 'cardio', durationMinutes: 3 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Morning Yoga Flow',
    description: '15-minute sun salutations and stretches to start your day',
    type: 'flexibility',
    goals: ['flexibility', 'recovery'],
    difficulty: 'beginner',
    equipment: ['yoga_mat'],
    workouts: [
      {
        name: 'Morning Flow',
        exerciseGroups: [
          {
            name: 'Sun Salutations',
            exercises: [
              { name: 'Sun Salutation A', type: 'flexibility', durationMinutes: 5 }
            ]
          },
          {
            name: 'Standing Poses',
            exercises: [
              { name: 'Standing Poses', type: 'flexibility', durationMinutes: 5 }
            ]
          },
          {
            name: 'Cool Down',
            exercises: [
              { name: 'Cool Down', type: 'flexibility', durationMinutes: 5 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Full Body 3x/week',
    description: 'Balanced strength, cardio, and flexibility training',
    type: 'combination',
    goals: ['general_fitness', 'weight_loss'],
    difficulty: 'beginner',
    equipment: ['dumbbells', 'yoga_mat'],
    workouts: [
      {
        name: 'Full Body Workout',
        exerciseGroups: [
          {
            name: 'Strength',
            exercises: [
              { name: 'Squats', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 60 },
              { name: 'Push-ups', type: 'strength', defaultSets: 3, defaultReps: 10, restSeconds: 60 },
              { name: 'Rows', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 60 },
              { name: 'Plank', type: 'strength', defaultSets: 3, defaultReps: 30, restSeconds: 30 }
            ]
          },
          {
            name: 'Cardio',
            exercises: [
              { name: 'Light Jog', type: 'cardio', durationMinutes: 15 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Starting Strength',
    description: 'Beginner linear progression program for rapid strength gains',
    type: 'weightlifting',
    goals: ['strength'],
    difficulty: 'beginner',
    equipment: ['barbell', 'squat_rack', 'bench'],
    workouts: [
      {
        name: 'Workout A',
        exerciseGroups: [
          {
            name: 'Main Lifts',
            exercises: [
              { name: 'Squat', type: 'strength', defaultSets: 3, defaultReps: 5, restSeconds: 180 },
              { name: 'Bench Press', type: 'strength', defaultSets: 3, defaultReps: 5, restSeconds: 180 },
              { name: 'Deadlift', type: 'strength', defaultSets: 1, defaultReps: 5, restSeconds: 180 }
            ]
          }
        ]
      },
      {
        name: 'Workout B',
        exerciseGroups: [
          {
            name: 'Main Lifts',
            exercises: [
              { name: 'Squat', type: 'strength', defaultSets: 3, defaultReps: 5, restSeconds: 180 },
              { name: 'Overhead Press', type: 'strength', defaultSets: 3, defaultReps: 5, restSeconds: 180 },
              { name: 'Power Clean', type: 'strength', defaultSets: 3, defaultReps: 5, restSeconds: 180 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: '5K Training',
    description: '8-week structured program to prepare for a 5K race',
    type: 'aerobic',
    goals: ['endurance', 'weight_loss'],
    difficulty: 'intermediate',
    equipment: ['running_shoes'],
    workouts: [
      {
        name: 'Easy Run',
        exerciseGroups: [
          {
            name: 'Easy Run',
            exercises: [
              { name: 'Easy Run', type: 'cardio', durationMinutes: 30 }
            ]
          }
        ]
      },
      {
        name: 'Tempo Run',
        exerciseGroups: [
          {
            name: 'Warmup',
            exercises: [
              { name: 'Warmup', type: 'cardio', durationMinutes: 10 }
            ]
          },
          {
            name: 'Tempo Pace',
            exercises: [
              { name: 'Tempo Pace', type: 'cardio', durationMinutes: 20 }
            ]
          },
          {
            name: 'Cooldown',
            exercises: [
              { name: 'Cooldown', type: 'cardio', durationMinutes: 10 }
            ]
          }
        ]
      },
      {
        name: 'Long Run',
        exerciseGroups: [
          {
            name: 'Long Run',
            exercises: [
              { name: 'Long Run', type: 'cardio', durationMinutes: 45 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Evening Stretch',
    description: '15-minute relaxation stretches to wind down your day',
    type: 'flexibility',
    goals: ['flexibility', 'recovery'],
    difficulty: 'beginner',
    equipment: ['yoga_mat'],
    workouts: [
      {
        name: 'Evening Flow',
        exerciseGroups: [
          {
            name: 'Seated Poses',
            exercises: [
              { name: 'Child\'s Pose', type: 'flexibility', durationMinutes: 3 },
              { name: 'Seated Forward Fold', type: 'flexibility', durationMinutes: 3 },
              { name: 'Butterfly Stretch', type: 'flexibility', durationMinutes: 3 }
            ]
          },
          {
            name: 'Spinal Mobility',
            exercises: [
              { name: 'Cat-Cow', type: 'flexibility', durationMinutes: 2 },
              { name: 'Supine Twist', type: 'flexibility', durationMinutes: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Pilates Basics',
    description: 'Core-focused 20-minute routine for strength and flexibility',
    type: 'flexibility',
    goals: ['core_strength', 'flexibility'],
    difficulty: 'beginner',
    equipment: ['yoga_mat'],
    workouts: [
      {
        name: 'Core Pilates',
        exerciseGroups: [
          {
            name: 'Warmup',
            exercises: [
              { name: 'The Hundred', type: 'flexibility', durationMinutes: 2 },
              { name: 'Roll Up', type: 'flexibility', durationMinutes: 2 }
            ]
          },
          {
            name: 'Core Work',
            exercises: [
              { name: 'Single Leg Circle', type: 'flexibility', durationMinutes: 3 },
              { name: 'Rolling Like a Ball', type: 'flexibility', durationMinutes: 2 },
              { name: 'Single Leg Stretch', type: 'flexibility', durationMinutes: 3 },
              { name: 'Plank', type: 'strength', defaultSets: 2, defaultReps: 10, restSeconds: 30 }
            ]
          },
          {
            name: 'Cool Down',
            exercises: [
              { name: 'Bridge', type: 'flexibility', durationMinutes: 3 },
              { name: 'Seal', type: 'flexibility', durationMinutes: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Athletic Conditioning',
    description: 'Mixed cardio, strength, and mobility for athletes',
    type: 'combination',
    goals: ['athletic', 'general_fitness'],
    difficulty: 'intermediate',
    equipment: ['dumbbells', 'pull_up_bar'],
    workouts: [
      {
        name: 'Conditioning Circuit',
        exerciseGroups: [
          {
            name: 'Warmup',
            exercises: [
              { name: 'Jumping Jacks', type: 'cardio', durationMinutes: 2 }
            ]
          },
          {
            name: 'Strength',
            exercises: [
              { name: 'Dumbbell Snatches', type: 'strength', defaultSets: 3, defaultReps: 10, restSeconds: 30 },
              { name: 'Goblet Squat', type: 'strength', defaultSets: 3, defaultReps: 12, restSeconds: 30 },
              { name: 'Pull-ups', type: 'strength', defaultSets: 3, defaultReps: 8, restSeconds: 45 },
              { name: 'Kettlebell Swings', type: 'strength', defaultSets: 3, defaultReps: 15, restSeconds: 30 }
            ]
          },
          {
            name: 'Cardio Finisher',
            exercises: [
              { name: 'Burpees', type: 'cardio', durationMinutes: 1 },
              { name: 'Mountain Climbers', type: 'cardio', durationMinutes: 1 },
              { name: 'Box Jumps', type: 'cardio', durationMinutes: 1 }
            ]
          }
        ]
      }
    ]
  }
]

let seedInFlight = null

const seedPrebuiltTemplates = async () => {
  if (seedInFlight) {
    return seedInFlight
  }

  seedInFlight = (async () => {
    let createdCount = 0
    try {
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!adminUser) {
        console.log('No admin user found, skipping template seed')
        return createdCount
      }

      console.log(`Seeding templates for admin user: ${adminUser.id}`)

      for (const templateData of PREBUILT_TEMPLATES) {
        const existing = await prisma.template.findFirst({
          where: { name: templateData.name, createdBy: adminUser.id }
        })

        if (!existing) {
          console.log(`Creating template: ${templateData.name}`)
          await prisma.template.create({
            data: {
              name: templateData.name,
              description: templateData.description,
              type: templateData.type,
              goals: templateData.goals,
              difficulty: templateData.difficulty,
              equipment: templateData.equipment,
              isPublic: true,
              createdBy: adminUser.id,
              workouts: {
                create: templateData.workouts.map((w, wi) => ({
                  name: w.name,
                  order: wi + 1,
                  exerciseGroups: {
                    create: w.exerciseGroups.map((g, gi) => ({
                      name: g.name,
                      order: gi + 1,
                      exercises: {
                        create: g.exercises.map((e, ei) => ({
                          name: e.name,
                          type: e.type,
                          defaultSets: e.defaultSets || null,
                          defaultReps: e.defaultReps || null,
                          restSeconds: e.restSeconds || null,
                          durationMinutes: e.durationMinutes || null,
                          order: ei + 1
                        }))
                      }
                    }))
                  }
                }))
              }
            }
          })
          createdCount++
          console.log(`Created template: ${templateData.name}`)
        } else {
          console.log(`Template already exists: ${templateData.name}`)
        }
      }
      console.log('Template seeding complete')
      return createdCount
    } catch (error) {
      console.error('Failed to seed prebuilt templates:', error.message)
      return createdCount
    } finally {
      seedInFlight = null
    }
  })()

  return seedInFlight
}

const getTemplates = async (req, res) => {
  const templates = await prisma.template.findMany({
    where: {
      OR: [
        { createdBy: req.userId },
        { isPublic: true }
      ]
    },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(templates)
}

const getPublicTemplates = async (req, res) => {
  const templates = await prisma.template.findMany({
    where: { isPublic: true },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(templates)
}

const getTemplate = async (req, res) => {
  const { id } = req.params

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }

  res.json(template)
}

const createTemplate = async (req, res) => {
  const { name, description, type, goals, difficulty, equipment, isPublic, workouts } = req.body

  const template = await prisma.template.create({
    data: {
      name,
      description,
      type,
      goals: goals || [],
      difficulty: difficulty || 'beginner',
      equipment: equipment || [],
      isPublic: isPublic || false,
      createdBy: req.userId,
      workouts: {
        create: workouts?.map((w, wi) => ({
          name: w.name,
          order: wi + 1,
          exerciseGroups: {
            create: w.exerciseGroups?.map((g, gi) => ({
              name: g.name,
              order: gi + 1,
              exercises: {
                create: g.exercises?.map((e, ei) => ({
                  name: e.name,
                  type: e.type,
                  defaultSets: e.sets || null,
                  defaultReps: e.reps || null,
                  restSeconds: e.rest || null,
                  durationMinutes: e.duration || null,
                  order: ei + 1
                })) || []
              }
            })) || []
          }
        })) || []
      }
    },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            }
          }
        }
      }
    }
  })

  res.status(201).json(template)
}

const updateTemplate = async (req, res) => {
  const { id } = req.params
  const { name, description, isPublic } = req.body

  const template = await prisma.template.findFirst({
    where: { id, createdBy: req.userId }
  })

  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }

  const updated = await prisma.template.update({
    where: { id },
    data: { name, description, isPublic }
  })

  res.json(updated)
}

const deleteTemplate = async (req, res) => {
  const { id } = req.params

  const template = await prisma.template.findFirst({
    where: { id, createdBy: req.userId }
  })

  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }

  await prisma.template.delete({ where: { id } })

  res.json({ message: 'Template deleted successfully' })
}

const createFromWorkout = async (req, res) => {
  const { workoutId } = req.params
  const { name, description, isPublic } = req.body

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      routine: { userId: req.userId }
    },
    include: {
      exercises: {
        include: {
          sets: true,
          aerobicLog: true,
          flexibilityLog: true
        },
        orderBy: { order: 'asc' }
      },
      routine: true
    }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const template = await prisma.template.create({
    data: {
      name: name || `Template from ${workout.name}`,
      description: description || `Created from ${workout.name}`,
      type: workout.routine.type,
      goals: [],
      difficulty: 'beginner',
      equipment: [],
      isPublic: isPublic || false,
      createdBy: req.userId,
      workouts: {
        create: [{
          name: workout.name,
          order: 1,
          exerciseGroups: {
            create: [{
              name: 'Main Exercises',
              order: 1,
              exercises: {
                create: workout.exercises.map((e, ei) => ({
                  name: e.name,
                  type: e.type,
                  defaultSets: e.sets?.length || null,
                  defaultReps: e.sets?.[0]?.reps || null,
                  restSeconds: 60,
                  order: ei + 1
                }))
              }
            }]
          }
        }]
      }
    },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            }
          }
        }
      }
    }
  })

  res.status(201).json(template)
}

const startFromTemplate = async (req, res) => {
  const { id } = req.params

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      workouts: {
        include: {
          exerciseGroups: {
            include: {
              exercises: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }

  const routine = await prisma.routine.create({
    data: {
      name: template.name,
      type: template.type,
      userId: req.userId,
      workouts: {
        create: template.workouts.map((w, wi) => ({
          name: w.name,
          order: wi + 1,
          exercises: {
            create: w.exerciseGroups.flatMap((g, gi) =>
              g.exercises.map((e, ei) => ({
                name: e.name,
                type: e.type,
                order: ei + 1
              }))
            )
          }
        }))
      }
    }
  })

  res.status(201).json(routine)
}

module.exports = {
  getTemplates,
  getPublicTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createFromWorkout,
  startFromTemplate,
  seedPrebuiltTemplates
}
