# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions. Built with Node.js, TypeScript, Express.js, and PostgreSQL.

---

## Tech Stack

| Technology | Version / Note |
|---|---|
| Node.js | LTS 24.x or higher |
| TypeScript | Latest stable |
| Express.js | Modular router architecture |
| PostgreSQL | Native `pg` driver only |
| Raw SQL | Direct `pool.query()` — no ORM, no query builders, no JOINs |
| bcrypt | Password hashing (salt rounds: 8–12) |
| jsonwebtoken | JWT generation & verification |

---

## Project Structure

```
DEVPULSE-ASSIGNMENT-2/
├── src/
│   ├── config/
│   │   └── index.ts              
│   ├── db/
│   │   ├── index.ts            
│   │   └── schema.ts            
│   ├── middleware/
│   │        
│   │   └── authmiddleware.ts     
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.service.ts
│   │   └── issues/
│   │       ├── issues.controller.ts
│   │       ├── issues.route.ts
│   │       └── issues.service.ts
│   ├── types/
│   │   ├── exporess.d.ts         # Express type augmentations
│   │   └── types.ts              # Shared TypeScript interfaces
│   ├── utility/
│   │   ├── sendResponse.ts       # Standardized API response helper
│   │   ├── tokens.ts             # JWT sign/verify helpers
│   │   └── userData.ts           # User data utilities
│   ├── app.ts                    # Express app setup & middleware registration
│   └── index.ts                  # Server entry point
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js LTS 24.x or higher
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/devpulse-assignment-2.git
cd devpulse-assignment-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

### 4. Run the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## Database Schema

### `users` Table

| Field | Type | Notes |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment |
| name | VARCHAR | Required |
| email | VARCHAR UNIQUE | Required |
| password | VARCHAR | Hashed, never exposed |
| role | VARCHAR | `contributor` or `maintainer`, default: `contributor` |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Auto-refreshed on update |

### `issues` Table

| Field | Type | Notes |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment |
| title | VARCHAR(150) | Required |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR | `bug` or `feature_request` |
| status | VARCHAR | `open`, `in_progress`, `resolved` — default: `open` |
| reporter_id | INTEGER | References `users.id` (app-level validation) |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Auto-refreshed on update |

---

## User Roles & Permissions

| Role | Permissions |
|---|---|
| `contributor` | Register, login, create issues, view all issues, update **own** issue (status must be `open`) |
| `maintainer` | All contributor permissions + update any issue + delete any issue + change workflow status freely |

---

## API Reference

### Authentication

#### `POST /api/auth/signup` — Register a new user

```json
// Request Body
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

```json
// Response 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

#### `POST /api/auth/login` — Login and receive JWT

```json
// Request Body
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

```json
// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor"
    }
  }
}
```

---

### Issues

All protected endpoints require:
```
Authorization: <JWT_TOKEN>
```

#### `POST /api/issues` — Create an issue *(Auth required)*

```json
// Request Body
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

```json
// Response 201
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

#### `GET /api/issues` — Get all issues *(Public)*

Supports optional query parameters:

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

Example: `GET /api/issues?sort=newest&type=bug&status=open`

#### `GET /api/issues/:id` — Get a single issue *(Public)*

#### `PATCH /api/issues/:id` — Update an issue *(Auth required)*

- **Maintainer**: can update any issue
- **Contributor**: can only update their own issue if status is `open`

```json
// Request Body (all fields optional)
{
  "title": "Updated title",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

#### `DELETE /api/issues/:id` — Delete an issue *(Maintainer only)*

---

## JWT Authentication Flow

```
Client → POST /auth/login → Server validates credentials
       ← Returns signed JWT (payload: id, name, role)

Client → Protected request with header: Authorization: <token>
       → Server verifies signature & expiry → processes request
```

---

## Security Rules

- Passwords are **never** returned in any API response or logged
- All protected endpoints reject requests without a valid JWT
- Role verification is performed **before** any privileged operation

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
