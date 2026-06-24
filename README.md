# Logistics Web App

A logistics app to create and track shipment orders. Monorepo with a Next.js frontend and an Express + Prisma backend, wired together with Turborepo.

## Stack

- **Frontend**: Next.js (pages router), React Query, axios, daisyUI + Tailwind, simple-react-validator
- **Backend**: Express, Prisma, Zod, PostgreSQL
- **Tooling**: Turborepo, TypeScript, Docker (local database)

## Prerequisites

- Node.js v18+
- npm v11+
- Docker (for the local database)

## Setup

### 1. Start the database

```bash
docker compose -f local.yaml up -d
```

PostgreSQL runs on port `5432`, pgAdmin on port `5050`.

### 2. Configure environment variables

```bash
cp .env.example .env
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run migrations, generate the client, and seed

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

## Running

```bash
npm run dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8000 |
| pgAdmin  | http://localhost:5050 |

### Connecting pgAdmin

pgAdmin runs in its own container and starts with no server registered. Log in
(`admin@admin.com` / `admin`), then add a server with **Object → Register → Server**:

| Field | Value      |
| ----- | ---------- |
| Host  | `postgres` |
| Port  | `5432`     |
| Database | `logistics` |
| Username | `postgres` |
| Password | `postgres` |

Use `postgres` (the compose service name) as the host, **not** `localhost`. Inside
the container `localhost` points at pgAdmin itself, so it returns
`connection refused`. `localhost:5432` only works from your host machine (e.g. the
backend's `.env`), not container-to-container.

## Project structure

```
backend/
  prisma/                 schema, migrations, seed
  src/
    lib/                  prisma client, error classes
    middlewares/          express error handler
    modules/item/         example resource (controller, service, schema, types)
    app.ts                express app + middleware
    routes.ts             route registration
    server.ts             entry point
frontend/
  src/
    components/           modal, toast container
    helper/               axios instance + helpers
    models/               status enums + badges
    pages/                app pages
  types/                  shared response types
```

The `item` module is a full vertical slice (create, list, get, update, delete) to copy when adding new resources.

## Commands

| Command                     | Description                          |
| --------------------------- | ------------------------------------ |
| `npm run dev`               | Run frontend and backend             |
| `npm run build`             | Build all packages                   |
| `npm run lint`              | Lint all packages                    |
| `npm run db:migrate`        | Run pending migrations (dev)         |
| `npm run db:generate`       | Generate the Prisma client           |
| `npm run db:seed`           | Seed the database                    |
| `npm run db:studio`         | Open Prisma Studio                   |
| `npm run db:reset`          | Reset the database                   |

## API

| Method | Path             | Description     |
| ------ | ---------------- | --------------- |
| POST   | `/api/items`     | Create an item  |
| GET    | `/api/items`     | List items      |
| GET    | `/api/items/:id` | Get one item    |
| PATCH  | `/api/items/:id` | Update an item  |
| DELETE | `/api/items/:id` | Delete an item  |
