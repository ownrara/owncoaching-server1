# OwnCoaching Backend (Express + PostgreSQL)

This is the **backend** for the OwnCoaching full-stack application.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- pg
- dotenv
- cors
- morgan

## Core Concept

- One coach (admin) exists by default
- All signups create client accounts
- Each client automatically gets:
  - Client profile
  - Training plan
  - Nutrition plan

## Environment Variables

Create a `.env` file based on `.env.sample`:

```
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/owncoaching
```

## Getting Started

```
cd owncoaching-backend
npm install
createdb owncoaching
psql -d owncoaching -f schema.sql
node server.js
```

Backend runs on: http://localhost:5000

## Project Structure

```
owncoaching-backend/
├── controllers/
│ ├── auth.controller.js
│ ├── clients.controller.js
│ ├── training.controller.js
│ ├── nutrition.controller.js
│ └── checkins.controller.js
├── routes/
│ ├── auth.routes.js
│ ├── clients.routes.js
│ ├── training.routes.js
│ ├── nutrition.routes.js
│ └── checkins.routes.js
├── db/
│ └── db.js
├── sql/
│ └── schema.sql
├── .env.sample
└── server.js
```

## API Overview

### Auth
- POST /api/auth/login
- POST /api/auth/signup

### Clients
- GET /api/clients/:id
- PUT /api/clients/:id

### Training
- GET /api/training/:clientId
- PUT /api/training/:clientId

### Nutrition
- GET /api/nutrition/:clientId
- PUT /api/nutrition/:clientId

### Check-ins
- POST /api/checkins
- GET /api/checkins
- PUT /api/checkins/:id/review
