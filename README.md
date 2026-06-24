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

### 4. Run migrations and generate the client

```bash
npm run db:migrate
npm run db:generate
```

### 5. (Optional) Seed sample data

```bash
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
(`admin@admin.com` / `admin`), then add a server with **Object -> Register -> Server**:

| Field    | Value       |
| -------- | ----------- |
| Host     | `postgres`  |
| Port     | `5432`      |
| Database | `logistics` |
| Username | `postgres`  |
| Password | `postgres`  |

Use `postgres` (the compose service name) as the host, **not** `localhost`. Inside
the container `localhost` points at pgAdmin itself, so it returns
`connection refused`. `localhost:5432` only works from your host machine (e.g. the
backend's `.env`), not container-to-container.

## Project structure

```
backend/
├── prisma/                 schema, migrations, seed
└── src/
    ├── lib/                prisma client, error classes, OpenAPI spec (openapi.ts)
    ├── middlewares/        express error handler
    ├── modules/order/      order resource (controller, service, schema, types)
    ├── app.ts              express app + middleware
    ├── routes.ts           route registration
    └── server.ts           entry point
frontend/
├── src/
│   ├── components/         modal, toast container
│   ├── helper/             axios instance + helpers
│   ├── models/             status enums + badges
│   └── pages/              app pages
└── types/                  shared response types
```

The `order` module is a full vertical slice (create, list, track, update status, cancel).

## Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Run frontend and backend     |
| `npm run build`       | Build all packages           |
| `npm run lint`        | Lint all packages            |
| `npm run db:migrate`  | Run pending migrations (dev) |
| `npm run db:generate` | Generate the Prisma client   |
| `npm run db:seed`     | Seed the database            |
| `npm run db:studio`   | Open Prisma Studio           |
| `npm run db:reset`    | Reset the database           |

## API

Interactive documentation (Swagger UI) is served at **http://localhost:8000/api/docs** while the backend is running. The raw OpenAPI spec lives in [`backend/src/lib/openapi.ts`](backend/src/lib/openapi.ts).

| Method | Path                                | Description                                                                                                                 |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/orders`                       | Create an order (sender, recipient, origin, destination). Generates a unique tracking number; status defaults to `PENDING`. |
| GET    | `/api/orders`                       | List orders. Optional `status` and `search` (tracking number, sender, or recipient) query filters.                                               |
| GET    | `/api/orders/track/:trackingNumber` | Look up a single order by its tracking number.                                                                              |
| GET    | `/api/orders/:id`                   | Get one order by id.                                                                                                        |
| PATCH  | `/api/orders/:id/status`            | Update status to `PENDING`, `IN_TRANSIT`, or `DELIVERED`.                                                                   |
| POST   | `/api/orders/:id/cancel`            | Cancel an order. Only allowed while status is `PENDING`; sets status to `CANCELED`.                                         |

### Order status

`PENDING` -> `IN_TRANSIT` -> `DELIVERED`. A `PENDING` order can instead be moved to `CANCELED` via the cancel endpoint.
