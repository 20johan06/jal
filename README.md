# HACK THE SYSTEM — Think. Decode. Breach.
### Event Infrastructure Platform • SRKR Engineering College

A secure, high-concurrency CTF and cybersecurity competition platform built for 40 four-member teams competing simultaneously on single-device team terminals, managed centrally by event organizers.

---

## 1. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Event Participants                       │
│    (40 Teams • 4 Members/Team • Single Laptop Terminal)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Frontend Client (Port 3000)                  │
│       React 18 • TypeScript • Vite • Tailwind CSS           │
│       Role-Aware Dashboards • Server Clock Skew Sync        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend API (Port 5000)                     │
│       Node.js • Express • TypeScript • Zod Validation       │
│       BCrypt (Salt 10) • JWT Auth • Anti-Bruteforce         │
└──────────────────────────────┬──────────────────────────────┘
                               │ mysql2 / Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (Port 3306)                      │
│       MySQL / MariaDB via XAMPP • utf8mb4 Collation         │
│  Admins • Teams • Rounds • Challenges • Submissions • Logs  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Software Requirements & Prerequisites

| Component | Minimum Version | Recommended Version |
|---|---|---|
| **Node.js** | `>= 20.0.0` | `20.x` or `22.x LTS` |
| **npm** | `>= 9.0.0` | `10.x` |
| **MySQL / MariaDB** | `>= 10.4 (MariaDB)` / `8.0 (MySQL)` | XAMPP 8.2+ bundled MySQL |
| **Web Browser** | Modern Chromium / Firefox | Chrome, Edge, or Firefox |

---

## 3. Repository Structure

```
Jal/
├── .gitignore                      # Protected environment & build exclusions
├── README.md                       # Platform documentation & operational runbook
├── backend/                        # Express API server
│   ├── .env.example                # Backend environment template
│   ├── package.json                # Server scripts & dependencies
│   ├── tsconfig.json               # Backend TypeScript configuration
│   └── src/
│       ├── app.ts                  # Express app setup, CORS & error handling
│       ├── server.ts               # Server startup & graceful shutdown
│       ├── config/
│       │   ├── db.ts               # MySQL connection pool (25 connections)
│       │   └── env.ts              # Validated environment loader
│       ├── db/
│       │   ├── schema.sql          # Idempotent DDL database schema
│       │   ├── migrate.ts          # Migration executor script
│       │   └── seed.ts             # Initial event seed (admin, rounds, teams)
│       ├── middleware/
│       │   ├── auth.ts             # JWT authentication & role authorization
│       │   └── rate-limiter.ts     # Anti-bruteforce sliding window limiter
│       ├── routes/
│       │   ├── auth.routes.ts      # Admin and team authentication routes
│       │   ├── admin.routes.ts     # Organizer controls & team registration
│       │   └── team.routes.ts      # Participant profile & isolated dashboard
│       └── scripts/
│           ├── create-admin.ts     # Hardened interactive admin manager
│           └── smoke-test.ts       # Automated integration test suite
└── frontend/                       # React client application
    ├── .env.example                # Frontend environment template
    ├── package.json                # Client scripts & dependencies
    ├── vite.config.ts              # Vite dev server with /api reverse proxy
    ├── tailwind.config.js          # Custom HTS cyber color theme
    ├── tsconfig.json               # Frontend TypeScript configuration
    └── src/
        ├── main.tsx                # Client entrypoint
        ├── App.tsx                 # Root component & state-based router
        ├── index.css               # Global styling & Tailwind directives
        ├── components/
        │   ├── Navbar.tsx          # Responsive navigation & role indicators
        │   └── Timer.tsx           # Server-synchronized live countdown timer
        ├── context/
        │   └── AuthContext.tsx     # Global JWT authentication provider
        ├── pages/
        │   ├── LandingPage.tsx     # Event landing & progression roadmap
        │   ├── AdminLoginPage.tsx  # Organizer credential entry
        │   ├── ParticipantLoginPage.tsx # Team ID & password access
        │   ├── AdminDashboardPage.tsx   # Live stats, roster & audit trail
        │   └── ParticipantDashboardPage.tsx # Team dashboard & round cards
        ├── services/
        │   └── api.ts              # Normalized API client with auto-fallback
        └── types/
            └── index.ts            # Shared TypeScript domain models
```

---

## 4. Environment Configuration

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
# In backend directory
cp .env.example .env
```

Configure parameters in `backend/.env`:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Database (XAMPP Default)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hack_the_system

# JWT Authentication
JWT_SECRET=use_a_long_random_alphanumeric_secret_key_here
JWT_EXPIRES_IN=24h

# Initial Admin Credentials (Used by seed script)
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=your_secure_admin_password_min_8_chars
```

> **Security Note:** Never commit `backend/.env` to source control. It is explicitly ignored by [.gitignore](file:///c:/Users/HP/Desktop/Jal/.gitignore).

### Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env` (optional for local development, recommended for LAN deployment):

```bash
# In frontend directory
cp .env.example .env
```

```ini
# Defaults to '/api' for Vite dev proxy.
# For campus lab LAN deployment across multiple PCs:
# VITE_API_URL=http://<BACKEND_HOST_IP>:5000/api
VITE_API_URL=/api
```

---

## 5. Database Setup & Initialization

### A. Start MySQL via XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** on the **MySQL** module.
3. Verify that the port shows `3306` and the status indicator turns green.

### B. Run Database Migrations
Executes [schema.sql](file:///c:/Users/HP/Desktop/Jal/backend/src/db/schema.sql) idempotently:
```bash
cd backend
npm run db:migrate
```

### C. Seed Initial Event Data
Creates the 3 official competition rounds (`ACCESS_DENIED`, `PHANTOM_TRACE`, `SYSTEM_OVERRIDE`), initial admin account, and starter test team:
```bash
npm run db:seed
```

### D. Create or Manage Administrators
To interactively create an organizer account with enforced validation:
```bash
npm run db:admin
```
*(Prompts securely for username and a minimum 8-character password. Refuses to overwrite existing passwords without explicit `--update` flag).*

---

## 6. Execution Runbook

### Running Locally for Development

Open two terminal windows:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
```
*API available at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.*

**Terminal 2 — Frontend Client:**
```bash
cd frontend
npm run dev
```
*Web application available at `http://localhost:3000`.*

---

## 7. Testing & Production Verification

### Automated Smoke Test Suite
Runs 10 automated assertions covering backend health, authentication, password verification, role boundaries, rate limiting, and team data isolation against MySQL:

```bash
cd backend
npm test
```

### Production Bundle Verification

**Compile Backend:**
```bash
cd backend
npm run build
```

**Compile Frontend:**
```bash
cd frontend
npm run build
```

---

## 8. Security & Event Hardening Features

1. **Anti-Bruteforce Rate Limiting:**
   - Dedicated sliding-window rate limiters on `/api/auth/admin/login` (10 requests/min per IP/username) and `/api/auth/team/login` (15 requests/min per IP/teamId).
   - Designed for shared campus Wi-Fi/NAT: one team's mistyped credentials will not lock out the rest of the lab.
   - Responds with HTTP `429 Too Many Requests` and a standard `Retry-After` header.
2. **Team Data Isolation:**
   - All participant endpoints (`/api/team/dashboard`, `/api/team/profile`) resolve team identity strictly from verified server-side JWT claims.
   - No participant endpoint returns other teams' credentials, submitted answers, or profiles.
3. **Password Protection:**
   - Hashed using `bcryptjs` with salt rounds = 10.
   - Minimum 8-character password length enforced programmatically on admin and team creation.
   - Hashes are never returned in JSON API responses.
4. **Server Time Synchronization:**
   - The countdown timer synchronizes against the backend server's timestamp to prevent teams from altering client device clocks.

---

## 9. Known Limitations & Phase 2 Roadmap

- **Phase 1 Boundary:** Challenge question viewer, evidence artifact decryption, and submission grading are Phase 2 features. Clicking "Inspect Evidence" in Phase 1 acts as a standby indicator.
- **In-Memory Rate Limiting:** The rate limiter currently utilizes an in-memory sliding window, which is ideal for single-node event servers. For multi-node load balancing, a Redis-backed store would be required.
- **Single Laptop Protocol:** Teams are intended to use one laptop per squad. Account sharing across multiple devices simultaneously is monitored via the security `audit_logs` table.
