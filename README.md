# OwnCoaching Backend (Node.js + Express + PostgreSQL)

This folder contains the **Node.js (Express)** backend API for **OwnCoaching**.

Key goals (course-style implementation):
- Simple REST API (JSON)
- PostgreSQL for persistence
- Role-based login: **coach** vs **client**
- On **client signup**, the system automatically creates:
  - a `clients` row
  - a default `training_plans` row
  - a default `nutrition_plans` row

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL

## Install

```bash
npm install
```

## Environment

Create a `.env` file in this backend folder (same level as `server.js`):

```env
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/owncoaching
```

## Database setup

1) Create the database (example):

```sql
CREATE DATABASE owncoaching;
```

2) Run the schema:

- Using `psql`:

```bash
psql -U postgres -d owncoaching -f sql/schema.sql
```

- Or using **pgAdmin** Query Tool: open `sql/schema.sql` and execute.

### What schema.sql does

`sql/schema.sql` creates the following tables:

- `clients`
- `users` (linked to `clients` by `users.client_id`)
- `training_plans` (per client)
- `nutrition_plans` (per client)
- `check_ins`

It also inserts **one default coach user** (the system's core admin account):

- Email: `coach@test.com`
- Password: `1234`
- Role: `coach`

## Run the server

```bash
npm start
```

Server will run on:

- `http://localhost:5000`
- Base API: `http://localhost:5000/api`

## Project structure

```
owncoaching-server1/
  server.js
  db/
    db.js
  routes/
    auth.routes.js
    clients.routes.js
    training.routes.js
    nutrition.routes.js
    checkins.routes.js
  controllers/
    auth.controller.js
    clients.controller.js
    training.controller.js
    nutrition.controller.js
    checkins.controller.js
  sql/
    schema.sql
```

## API endpoints

### Health

- `GET /api/health` → `{ ok: true, service: "owncoaching-backend" }`
- `GET /api/db-check` → checks Postgres connection

### Auth

- `POST /api/auth/login`
  - body: `{ email, password }`
  - returns: `{ ok: true, user: { id, email, role, clientId } }`

- `POST /api/auth/signup`
  - body: `{ email, password }`
  - role is **always client**
  - returns: `{ ok: true, user: { id, email, role, clientId } }`

Important behavior:
- Signup does **not** accept role.
- When a client signs up, the backend:
  1. Creates a user row (`users.role = 'client'`)
  2. Creates the corresponding `clients` row
  3. Inserts default rows into `training_plans` and `nutrition_plans`

### Clients

- `GET /api/clients` → list clients
- `GET /api/clients/:clientId` → single client
- `PUT /api/clients/:clientId` → update client profile

### Training Plans

- `GET /api/training/:clientId` → returns plan JSON
- `PUT /api/training/:clientId` → replace plan JSON

### Nutrition Plans

- `GET /api/nutrition/:clientId` → returns nutrition JSON
- `PUT /api/nutrition/:clientId` → replace nutrition JSON

### Check-ins

- `GET /api/checkins` (supports query: `?clientId=c1`)
- `GET /api/checkins/:checkInId`
- `POST /api/checkins` → create new check-in
- `PATCH /api/checkins/:checkInId` → coach review (status + coach notes)

## Quick verification (recommended)

1) Run `sql/schema.sql`
2) Start backend
3) Start frontend
4) Login as coach: `coach@test.com / 1234`
5) Signup a new client and login as that client
6) Submit a weekly check-in (client)
7) Review the check-in (coach) and confirm it appears in client dashboard
