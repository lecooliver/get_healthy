# Get Healthy - Application Context

## Overview
Fitness tracking application for tracking workouts, body measurements, and progress toward health goals.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Vue.js 3 + Vite + Tailwind CSS + Vue Router + Pinia |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Passport.js (Local + OIDC/OAuth2) |
| API | REST |
| Deployment | Docker Compose |

## Project Structure
```
/get_healthy
├── /frontend          # Vue.js SPA
├── /backend           # Express.js API
├── /docker            # Docker configs
├── docker-compose.yml
└── README.md
```

## Database Schema

### Core Entities
- **User** - id, email, password_hash, role (admin/user), created_at
- **UserProfile** - user_id, display_name, avatar_url, height, age, weight_unit
- **BodyMeasurement** - id, user_id, date, weight, waist, hips, chest, thigh_l, thigh_r, bicep_l, bicep_r, shoulder_span, calf_l, calf_r, back_span, neck, body_fat_percentage
- **Routine** - id, user_id, name, type (weightlifting/aerobic/flexibility/combination)
- **Workout** - id, routine_id, name, scheduled_date, completed_at
- **Exercise** - id, workout_id, name, type, order
- **ExerciseSet** - id, exercise_id, set_number, reps, weight, rpe, completed
- **AerobicLog** - id, exercise_id, duration_minutes, distance, distance_unit, heart_rate, calories, blood_pressure_systolic, blood_pressure_diastolic, spo2
- **FlexibilityLog** - id, exercise_id, duration_minutes, notes

### Template Entities
- **Template** - id, name, description, type, goals[], difficulty, equipment[], is_public, created_by
- **TemplateWorkout** - id, template_id, order, name
- **TemplateExercise** - id, template_workout_id, name, type, default_sets, default_reps, rest_seconds, notes

### Scheduling Entities
- **ScheduledWorkout** - id, user_id, routine_id, scheduled_date, cadence_type, cadence_value

### Limits Entities
- **ExerciseLimit** - id, user_id, exercise_name, limit_type (upper/lower), value, unit, created_at

### Photo Journal Entities
- **Photo** - id, user_id, filename, original_name, category, notes, taken_at, created_at

## API Endpoints (REST)

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/oidc/* (OIDC routes)
- GET /api/auth/me

### Profile & Settings
- GET/PUT /api/profile
- POST /api/profile/avatar

### Body Measurements
- GET/POST /api/measurements
- GET /api/measurements/history
- GET /api/measurements/latest

### Routines
- GET/POST /api/routines
- GET/PUT/DELETE /api/routines/:id

### Workouts
- GET/POST /api/routines/:routineId/workouts
- GET/PUT/DELETE /api/routines/:routineId/workouts/:id

### Exercises
- GET/POST /api/workouts/:workoutId/exercises
- GET/PUT/DELETE /api/exercises/:id

### Sets & Logs
- GET/POST /api/exercises/:exerciseId/sets
- PUT/DELETE /api/sets/:id
- POST /api/exercises/:exerciseId/aerobic-log
- POST /api/exercises/:exerciseId/flexibility-log

### Templates
- GET/POST /api/templates
- GET/PUT/DELETE /api/templates/:id
- GET /api/templates/public
- POST /api/templates/from-workout/:workoutId

### Scheduling
- GET/POST /api/schedule
- PUT/DELETE /api/schedule/:id

### Exercise Limits
- GET /api/limits
- GET /api/limits/exercise/:exerciseName
- POST /api/limits
- POST /api/limits/check
- DELETE /api/limits/:id

### Photo Journal
- GET /api/photos
- GET /api/photos/categories
- GET /api/photos/category/:category
- GET /api/photos/:id
- POST /api/photos
- PUT /api/photos/:id
- DELETE /api/photos/:id

### Reporting
- GET /api/reports/progress?metric=weight|measurements
- GET /api/reports/calories?range=week|month|year
- GET /api/reports/by-time-of-day
- GET /api/reports/workout-frequency

### Export
- GET /api/export/json
- GET /api/export/csv

### Admin
- GET /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- GET /api/admin/stats

## Frontend Pages
| Route | Description |
|-------|-------------|
| `/` | Landing/redirect to dashboard |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Summary charts, recent activity, motivational messages |
| `/profile` | Edit profile, photo, settings (light/dark mode), exercise limits |
| `/measurements` | Body measurement history, add new entry, charts |
| `/photos` | Photo journal with upload, categories, and timelapse |
| `/routines` | List/create/edit routines |
| `/routines/:id/workouts` | Workout log interface |
| `/templates` | Browse template library |
| `/templates/:id` | Template details |
| `/schedule` | Calendar view, cadence setup |
| `/reports` | Progress charts, time-of-day analysis |
| `/export` | Download JSON/CSV |
| `/admin` | User management, system stats |

## Pre-Built Workout Templates

### Strength
- **StrongLifts 5x5** - Squat, Bench, Row (A) / Squat, OHP, Deadlift (B), 5x5 @ weight progression
- **Push/Pull/Legs (PPL)** - 6-day split with detailed exercises per day
- **Starting Strength** - Squat, Bench, Deadlift, OHP, Power Clean

### Cardio
- **Couch to 5K** - Walk/run intervals over 9 weeks
- **5K Training** - 8-week structured 5K prep
- **HIIT 20-min** - 4-min warmup, 8 rounds (20s work/10s rest), 3-min cooldown

### Flexibility
- **Morning Yoga Flow** - 15-min sun salutations and stretches
- **Evening Stretch** - 15-min relaxation poses
- **Pilates Basics** - Core-focused 20-min routine

### Combination
- **Full Body 3x/week** - Strength + cardio + flexibility balanced
- **Athletic Conditioning** - Mixed cardio, strength, and mobility

## Features Checklist

### Authentication
- [x] Local email/password registration & login
- [x] Session management
- [x] OIDC/OAuth2 integration (SSO)
- [x] Password reset flow
- [x] Email verification

### User Profile
- [x] Display name
- [x] Avatar/photo upload
- [x] Height
- [x] Age
- [x] Weight tracking
- [x] Light/Dark mode (device-detected default)
- [x] Manual mode toggle
- [x] Data deletion with confirmation

### Body Measurements
- [x] Weight
- [x] Waist, Hips, Chest
- [x] Thighs (L/R)
- [x] Biceps (L/R)
- [x] Shoulders
- [x] Calves (L/R)
- [x] Back span
- [x] Neck
- [x] Body fat percentage
- [x] Historical tracking with charts

### Workout Tracking
- [x] Create/edit routines
- [x] Routine types: Weightlifting, Aerobic, Flexibility, Combination
- [x] Multiple workouts per routine
- [x] Multiple exercises per workout
- [x] Quick-entry UI for sets/reps (mobile optimized)
- [x] Muscle failure indicator (RPE)

### Aerobic Workouts
- [x] Duration logging
- [x] Distance (miles/km)
- [x] Heart rate
- [x] Calories (calculated)
- [x] Blood pressure
- [x] SPO2

### Flexibility Workouts
- [x] Duration per exercise
- [x] Notes

### Workout Templates
- [x] Pre-built template library
- [x] Create custom templates
- [x] Save workout as template
- [x] Browse/search templates
- [x] Filter by type, goal, difficulty
- [x] Detailed exercises with sets/reps/rest

### Scheduling
- [x] Schedule workouts on specific dates
- [x] Cadence system (every X days)
- [x] Calendar view
- [x] Notifications/reminders

### Reporting & Dashboard
- [x] Dashboard with summary charts
- [x] Progress tracking charts
- [x] Time-of-day analysis
- [x] Motivational messages
- [x] Calorie tracking

### Limits & Recovery
- [x] Set upper/lower limits per exercise
- [x] Recovery suggestions when limits exceeded

### Photo Journal
- [x] Photo upload with categorization
- [x] Photo gallery view by category
- [x] Edit/delete photos
- [x] Timelapse playback for progress visualization
- [x] Date tracking for photos

### Data Management
- [x] Full data deletion
- [x] JSON export
- [x] CSV export

### Admin
- [x] Admin dashboard
- [x] User management
- [x] System statistics

### AI Integration
- [x] Backend hooks for AI integration
- [x] Ollama support
- [ ] Online AI support

### Testing
- [x] Unit tests (backend)
- [x] API tests
- [x] Frontend component tests
- [x] E2E tests

## Implementation Phases

### Phase 1: Foundation
1. Initialize monorepo structure
2. Set up Docker Compose
3. Configure PostgreSQL with Prisma
4. Implement user auth (local)
5. Set up Vue.js frontend with Tailwind

### Phase 2: Core Features
1. User profile & settings
2. Body measurements CRUD
3. Routines CRUD
4. Workouts & exercises CRUD

### Phase 3: Workout Logging
1. Exercise set logging
2. Quick-entry UI for mobile
3. Aerobic & flexibility logging
4. RPE/muscle failure tracking

### Phase 4: Templates
1. Template library structure
2. Pre-built templates
3. Custom template creation
4. Template browser UI

### Phase 5: Scheduling & Limits
1. Workout scheduling
2. Cadence system
3. Upper/lower limits
4. Recovery suggestions

### Phase 6: Reporting
1. Dashboard charts
2. Progress tracking
3. Time-of-day analysis
4. Motivational messages

### Phase 7: Polish
1. Admin panel
2. Data export (JSON/CSV)
3. OIDC integration
4. Comprehensive tests
5. Refinement

## Commands

### Development
```bash
# Start all services
docker-compose up

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

### Build
```bash
# Build Docker images
docker-compose build

# Production build
docker-compose -f docker-compose.prod.yml up
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/get_healthy
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Notes
- Dark/Light mode defaults to device preference via `prefers-color-scheme`
- Quick-entry UI prioritizes large touch targets for gym use
- All dates stored in UTC, displayed in user's local timezone
- File uploads stored locally in `/uploads` directory (can be extended to S3/etc)
