describe('seedPrebuiltTemplates', () => {
  let seedPrebuiltTemplates
  const mockPrisma = global.mockPrismaClient
  const adminUser = { id: 'admin-1', role: 'admin', email: 'admin@example.com' }

  beforeAll(() => {
    const controller = require('../src/controllers/templateController')
    seedPrebuiltTemplates = controller.seedPrebuiltTemplates
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates all prebuilt templates when none exist', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(adminUser)
    mockPrisma.template.findFirst.mockResolvedValue(null)
    mockPrisma.template.create.mockResolvedValue({})

    const created = await seedPrebuiltTemplates()

    expect(created).toBe(11)
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { role: 'admin' } })
    expect(mockPrisma.template.create).toHaveBeenCalledTimes(11)
  })

  it('seeds templates as public and owned by the admin with nested workouts and exercises', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(adminUser)
    mockPrisma.template.findFirst.mockResolvedValue(null)
    mockPrisma.template.create.mockResolvedValue({})

    await seedPrebuiltTemplates()

    const calls = mockPrisma.template.create.mock.calls.map(call => call[0].data)

    for (const data of calls) {
      expect(data.isPublic).toBe(true)
      expect(data.createdBy).toBe(adminUser.id)
      expect(data.workouts.create.length).toBeGreaterThan(0)
      for (const workout of data.workouts.create) {
        for (const group of workout.exerciseGroups.create) {
          expect(group.exercises.create.length).toBeGreaterThan(0)
          for (const exercise of group.exercises.create) {
            expect(exercise.order).toBeGreaterThan(0)
            expect(exercise.type).toBeDefined()
          }
        }
      }
    }

    const strongLifts = calls.find(t => t.name === 'StrongLifts 5x5')
    expect(strongLifts).toBeDefined()
    expect(strongLifts.type).toBe('weightlifting')
    expect(strongLifts.workouts.create).toHaveLength(2)
    expect(strongLifts.workouts.create[0].exerciseGroups.create[0].exercises.create.map(e => e.name))
      .toEqual(['Squat', 'Bench Press', 'Barbell Row'])
    expect(strongLifts.workouts.create[0].exerciseGroups.create[0].exercises.create[0].defaultSets).toBe(5)
  })

  it('skips templates that already exist for the admin', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(adminUser)
    mockPrisma.template.findFirst.mockResolvedValue({ id: 'existing-template' })

    const created = await seedPrebuiltTemplates()

    expect(created).toBe(0)
    expect(mockPrisma.template.findFirst).toHaveBeenCalledTimes(11)
    expect(mockPrisma.template.create).not.toHaveBeenCalled()
  })

  it('only creates missing templates when some already exist (idempotent)', async () => {
    const createdNames = new Set(['StrongLifts 5x5'])

    mockPrisma.user.findFirst.mockResolvedValue(adminUser)
    mockPrisma.template.findFirst.mockImplementation(async ({ where }) =>
      createdNames.has(where.name) ? { id: `tpl-${where.name}` } : null)
    mockPrisma.template.create.mockImplementation(async ({ data }) => {
      createdNames.add(data.name)
      return { id: `tpl-${data.name}` }
    })

    const firstRun = await seedPrebuiltTemplates()
    const secondRun = await seedPrebuiltTemplates()
    const thirdRun = await seedPrebuiltTemplates()

    expect(firstRun).toBe(10)
    expect(secondRun).toBe(0)
    expect(thirdRun).toBe(0)
    expect(createdNames.size).toBe(11)
    expect(mockPrisma.template.create).toHaveBeenCalledTimes(10)
  })

  it('does nothing when no admin user exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)

    const created = await seedPrebuiltTemplates()

    expect(created).toBe(0)
    expect(mockPrisma.template.findFirst).not.toHaveBeenCalled()
    expect(mockPrisma.template.create).not.toHaveBeenCalled()
  })

  it('resolves without throwing when database errors occur mid-seed', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(adminUser)
    mockPrisma.template.findFirst.mockResolvedValue(null)
    let calls = 0
    mockPrisma.template.create.mockImplementation(async () => {
      calls++
      if (calls === 3) throw new Error('database exploded')
      return {}
    })

    await expect(seedPrebuiltTemplates()).resolves.toBe(2)
    expect(mockPrisma.template.create).toHaveBeenCalledTimes(3)
  })

  it('shares a single run when triggered concurrently (no duplicates)', async () => {
    let resolveAdminLookup
    mockPrisma.user.findFirst.mockReturnValue(
      new Promise(resolve => { resolveAdminLookup = resolve })
    )
    mockPrisma.template.findFirst.mockResolvedValue(null)
    mockPrisma.template.create.mockResolvedValue({})

    const first = seedPrebuiltTemplates()
    const second = seedPrebuiltTemplates()

    resolveAdminLookup(adminUser)
    const [firstResult, secondResult] = await Promise.all([first, second])

    expect(firstResult).toBe(11)
    expect(secondResult).toBe(11)
    expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1)
    expect(mockPrisma.template.create).toHaveBeenCalledTimes(11)
  })
})
