# Get Healthy

A clean, open-source fitness tracking application to help you track workouts, body measurements, and progress toward health goals.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue.js 3 + Vite + Tailwind CSS + Vue Router + Pinia |
| Backend | Node.js + Express.js + Passport.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Local) + OIDC/OAuth2 (Google, GitHub, Keycloak, Authentik, Authelia) |
| API | REST |
| Deployment | Docker Compose |

## Features

### Authentication
- [x] Email/password registration and login
- [x] OIDC/OAuth2 integration (Google, GitHub, Keycloak, Authentik, Authelia, Generic OIDC)
- [x] Password reset flow with SMTP email support
- [x] Email verification
- [x] First registered user automatically becomes admin

### User Profile
- [x] Display name, avatar upload
- [x] Height, age, current weight tracking
- [x] Preferred weight unit (lb/kg)
- [x] Light/Dark mode with device detection
- [x] Push notification preferences
- [x] Full data deletion

### Body Measurements
- [x] Weight, body fat percentage
- [x] Body measurements: waist, hips, chest, thighs, biceps, calves, shoulders, back span, neck
- [x] Historical tracking with interactive charts
- [x] Progress visualization over time

### Workout Tracking
- [x] Create and manage workout routines
- [x] Routine types: Weightlifting, Aerobic, Flexibility, Combination
- [x] Exercise types: Strength, Cardio, Flexibility
- [x] Quick-entry UI for sets/reps/weight (mobile optimized)
- [x] RPE (Rate of Perceived Exertion) tracking
- [x] Continue previous incomplete workouts
- [x] Archive workouts individually or batch (by date range or name pattern)
- [x] View and restore archived workouts
- [x] Exercise name autocomplete from history

### Workout Templates
- [x] Pre-built template library (StrongLifts, PPL, Couch to 5K, Starting Strength, 5K Training, HIIT, Yoga, Pilates, etc.)
- [x] Create custom templates with workout builder
- [x] Save workout as template
- [x] Browse/search templates by type, goal, difficulty

### Photo Journal
- [x] Upload progress photos with categorization
- [x] Gallery view organized by category
- [x] Edit photo details (category, notes, date)
- [x] Timelapse playback for progress visualization
- [x] Full-screen photo viewer

### Exercise Limits
- [x] Set upper/lower limits per exercise
- [x] Visual badges for limits in profile
- [x] Quick add/delete limits from profile

### Scheduling
- [x] Schedule workouts on specific dates
- [x] Cadence system (every X days)
- [x] Calendar view
- [x] Push notification reminders (HTTPS required)

### Reporting & Dashboard
- [x] Dashboard with summary charts
- [x] Progress tracking charts
- [x] Time-of-day analysis
- [x] Motivational messages
- [x] Calorie tracking

### Admin
- [x] Admin dashboard
- [x] User management
- [x] System statistics
- [x] SMTP configuration and testing
- [x] OIDC provider configuration

### AI Integration
- [x] Backend hooks for Ollama integration
- [ ] Online AI support (OpenAI/Anthropic)

### Data Management
- [x] JSON export
- [x] CSV export
- [x] Full data deletion

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/your-repo/get_healthy.git
cd get_healthy

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

### Development Setup

1. **Install dependencies:**

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

2. **Start PostgreSQL with Docker:**

```bash
docker-compose up -d db
```

3. **Set up the database:**

```bash
cd backend
npx prisma db push
npx prisma generate
```

4. **Start the backend:**

```bash
cd backend
npm run dev
```

5. **Start the frontend (in another terminal):**

```bash
cd frontend
npm run dev
```

6. **Access the app:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/get_healthy
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# OAuth / OIDC (optional - configure any combination)

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/oidc/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/oidc/github/callback

# Keycloak OIDC
KEYCLOAK_CLIENT_ID=your-keycloak-client-id
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_ISSUER=https://your-keycloak.com/realms/your-realm
KEYCLOAK_AUTHORIZATION_URL=https://your-keycloak.com/realms/your-realm/protocol/openid-connect/auth
KEYCLOAK_TOKEN_URL=https://your-keycloak.com/realms/your-realm/protocol/openid-connect/token
KEYCLOAK_USERINFO_URL=https://your-keycloak.com/realms/your-realm/protocol/openid-connect/userinfo
KEYCLOAK_CALLBACK_URL=http://localhost:3000/api/auth/oidc/keycloak/callback

# Authentik OIDC
AUTHENTIK_CLIENT_ID=your-authentik-client-id
AUTHENTIK_CLIENT_SECRET=your-authentik-client-secret
AUTHENTIK_ISSUER=https://your-authentik.com
AUTHENTIK_AUTHORIZATION_URL=https://your-authentik.com/application/o/authorize/
AUTHENTIK_TOKEN_URL=https://your-authentik.com/application/o/token/
AUTHENTIK_USERINFO_URL=https://your-authentik.com/application/o/userinfo/
AUTHENTIK_CALLBACK_URL=http://localhost:3000/api/auth/oidc/authentik/callback

# Authelia OIDC
AUTHELIA_CLIENT_ID=your-authelia-client-id
AUTHELIA_CLIENT_SECRET=your-authelia-client-secret
AUTHELIA_ISSUER=https://your-authelia.com
AUTHELIA_AUTHORIZATION_URL=https://your-authelia.com/api/oidc/authorization
AUTHELIA_TOKEN_URL=https://your-authelia.com/api/oidc/token
AUTHELIA_USERINFO_URL=https://your-authelia.com/api/oidc/userinfo
AUTHELIA_CALLBACK_URL=http://localhost:3000/api/auth/oidc/authelia/callback

# Generic OIDC Provider
OIDC_CLIENT_ID=your-oidc-client-id
OIDC_CLIENT_SECRET=your-oidc-client-secret
OIDC_ISSUER=https://your-idp.com
OIDC_AUTHORIZATION_URL=https://your-idp.com/authorize
OIDC_TOKEN_URL=https://your-idp.com/token
OIDC_USERINFO_URL=https://your-idp.com/userinfo
OIDC_CALLBACK_URL=http://localhost:3000/api/auth/oidc/generic/callback

# SMTP Configuration (optional - for password reset emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=your-from-email@example.com
SMTP_FROM_NAME=Get Healthy
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## OIDC Setup

The application supports OAuth/OIDC authentication with both cloud providers (Google, GitHub) and self-hosted identity providers.

### Supported Providers

| Provider | Type | Protocol |
|----------|------|----------|
| Google | Cloud | OAuth 2.0 |
| GitHub | Cloud | OAuth 2.0 |
| Keycloak | Self-hosted | OIDC |
| Authentik | Self-hosted | OIDC |
| Authelia | Self-hosted | OIDC |
| Generic | Self-hosted | OIDC |

### Keycloak Setup

1. **Create a realm** in Keycloak or use an existing one

2. **Create a client:**
   - Client ID: `get-healthy`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/api/auth/oidc/keycloak/callback`

3. **Get credentials** from the Credentials tab

4. **Get endpoints** from: Realm Settings → Endpoints → OpenID Endpoint Configuration

5. **Set environment variables** (see above)

### Authentik Setup

1. **Create an OAuth2 Provider:**
   - Name: `Get Healthy`
   - Client ID: `get-healthy` (auto-generated)
   - Redirect URIs: `http://localhost:3000/api/auth/oidc/authentik/callback`

2. **Create an Application** linked to the provider

3. **Set environment variables** (see above)

### Generic OIDC Provider

For any OIDC-compliant provider, use the generic configuration with your provider's endpoints.

### SMTP Setup

SMTP settings can also be configured from the Admin panel (Email tab):

1. Navigate to Admin → Email
2. Enter your SMTP credentials
3. Click "Test Connection" to verify
4. Save settings

**Common SMTP Providers:**
- Gmail: smtp.gmail.com | Port 587 | Requires App Password
- Outlook: smtp-mail.outlook.com | Port 587 | TLS
- SendGrid: smtp.sendgrid.net | Port 587 | API Key
- Mailgun: smtp.mailgun.org | Port 587 | TLS
- AWS SES: email-smtp.us-east-1.amazonaws.com | Port 587 | SMTP credentials

### Production Deployment

For production, update callback URLs to use your production domain:

```env
FRONTEND_URL=https://get-healthy.example.com
GOOGLE_CALLBACK_URL=https://get-healthy.example.com/api/auth/oidc/google/callback
# etc.
```

## Project Structure

```
/get_healthy
├── /frontend          # Vue.js SPA
│   ├── /src
│   │   ├── /components   # Reusable components (ConfirmModal, HelpIcon, etc.)
│   │   ├── /views        # Page components (Dashboard, Workout, etc.)
│   │   ├── /stores       # Pinia stores (auth, ui, notifications)
│   │   └── /router       # Vue Router config
│   └── ...
├── /backend           # Express.js API
│   ├── /src
│   │   ├── /routes       # API routes
│   │   ├── /controllers  # Route handlers
│   │   ├── /middleware   # Express middleware
│   │   └── /utils       # Utilities (passport-config, emailService, etc.)
│   └── /prisma          # Database schema
├── /docker            # Docker configs
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/password-reset/forgot` - Request password reset
- `POST /api/password-reset/reset` - Reset password with token
- `POST /api/email/verify` - Verify email
- `POST /api/email/resend` - Resend verification email
- `GET /api/auth/oidc/:provider` - Initiate OIDC flow
- `GET /api/auth/oidc/:provider/callback` - OIDC callback

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile (displayName, height, age, weight, weightUnit)
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile` - Delete all user data

### Body Measurements
- `GET/POST /api/measurements` - List/create measurements
- `GET /api/measurements/history` - Measurement history
- `GET /api/measurements/latest` - Latest measurement

### Photo Journal
- `GET /api/photos` - List all photos (optional `?category=` filter)
- `GET /api/photos/categories` - Get unique categories
- `GET /api/photos/category/:category` - Get photos by category
- `GET /api/photos/:id` - Get single photo
- `POST /api/photos` - Upload photo (multipart/form-data)
- `PUT /api/photos/:id` - Update photo (category, notes, takenAt)
- `DELETE /api/photos/:id` - Delete photo

### Routines
- `GET/POST /api/routines` - List/create routines
- `GET/PUT/DELETE /api/routines/:id` - Routine CRUD
- `GET /api/routines/:id` - Get routine with workouts

### Workouts
- `GET/POST /api/routines/:routineId/workouts` - List/create workouts
- `GET/PUT/DELETE /api/routines/:routineId/workouts/:id` - Workout CRUD
- `POST /api/routines/:routineId/workouts/:id/complete` - Complete workout
- `POST /api/routines/:routineId/workouts/:id/archive` - Archive workout
- `POST /api/routines/:routineId/workouts/:id/unarchive` - Restore workout
- `GET /api/routines/:routineId/workouts/archived` - Get archived workouts
- `POST /api/routines/:routineId/workouts/batch-archive` - Batch archive by filter

### Exercises
- `GET/POST /api/workouts/:workoutId/exercises` - List/create exercises
- `PUT/DELETE /api/exercises/:id` - Exercise CRUD

### Sets & Logs
- `GET/POST /api/exercises/:exerciseId/sets` - List/create sets
- `PUT/DELETE /api/sets/:id` - Set CRUD
- `POST /api/exercises/:exerciseId/aerobic-log` - Log aerobic data
- `PUT/DELETE /api/cardio-logs/:id` - Cardio log CRUD
- `POST /api/exercises/:exerciseId/flexibility-log` - Log flexibility data

### Templates
- `GET/POST /api/templates` - List/create templates
- `GET/PUT/DELETE /api/templates/:id` - Template CRUD
- `GET /api/templates/public` - Public templates
- `POST /api/templates/from-workout/:workoutId` - Save workout as template
- `POST /api/templates/:id/start` - Start workout from template

### Exercise Limits
- `GET /api/limits` - List all limits
- `GET /api/limits/exercise/:exerciseName` - Get limits for exercise
- `POST /api/limits` - Create/update limit
- `POST /api/limits/check` - Check if value violates limit
- `DELETE /api/limits/:id` - Delete limit

### Schedule
- `GET/POST /api/schedule` - List/create scheduled workouts
- `PUT/DELETE /api/schedule/:id` - Schedule CRUD

### Reports
- `GET /api/reports/progress` - Progress data
- `GET /api/reports/calories` - Calorie data
- `GET /api/reports/by-time-of-day` - Time analysis
- `GET /api/reports/workout-frequency` - Workout frequency
- `GET /api/reports/dashboard` - Dashboard data

### Dashboard
- `GET /api/dashboard` - Dashboard data (alias for /api/reports/dashboard)

### Export
- `GET /api/export/json` - Export all data as JSON
- `GET /api/export/csv` - Export measurements as CSV

### Admin
- `GET /api/admin/users` - List users
- `PUT/DELETE /api/admin/users/:id` - Update/delete user
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings/oidc` - Update OIDC settings
- `PUT /api/admin/settings/smtp` - Update SMTP settings
- `POST /api/admin/settings/smtp/test` - Test SMTP connection

### AI
- `POST /api/ai/analyze` - Analyze workout with Ollama
- `GET /api/ai/health` - Check Ollama connection

## Scripts

```bash
# Backend
cd backend
npm run dev          # Development server
npm start           # Production server
npx prisma db push  # Push schema to database
npx prisma generate # Generate Prisma client
npx prisma studio   # Open Prisma Studio
npm test            # Run tests (88 tests passing)

# Frontend
cd frontend
npm run dev         # Development server (http://localhost:5173)
npm run build       # Production build
npm test            # Run tests (21 tests passing)
npm run test:e2e   # Run E2E tests
npm run lint        # Run ESLint
```

## Database Schema

### Core Entities
- **User** - id, email, password_hash, role, provider, avatar, verification
- **UserProfile** - user_id, display_name, height, age, weight, weight_unit, avatar_url
- **BodyMeasurement** - weight, body fat, waist, hips, chest, thighs, biceps, calves, etc.
- **Routine** - id, name, type (weightlifting/aerobic/flexibility/combination)
- **Workout** - id, routine_id, name, scheduled_date, completed_at, archived
- **Exercise** - id, workout_id, name, type (strength/cardio/flexibility)
- **ExerciseSet** - id, exercise_id, set_number, reps, weight, rpe, completed
- **AerobicLog** - duration, distance, heart_rate, calories, blood_pressure, spo2
- **FlexibilityLog** - duration, notes

### Template Entities
- **Template** - id, name, description, type, goals[], difficulty, equipment[], is_public
- **TemplateWorkout** - id, template_id, name, order
- **TemplateExercise** - id, template_workout_id, name, type, default_sets, default_reps, rest_seconds

### Scheduling Entities
- **ScheduledWorkout** - id, user_id, routine_id, scheduled_date, cadence_type, cadence_value

### Limits Entities
- **ExerciseLimit** - id, user_id, exercise_name, limit_type (upper/lower), value, unit

### Photo Journal Entities
- **Photo** - id, user_id, filename, original_name, category, notes, taken_at, created_at

## License

GPLv3
