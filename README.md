# Mahalaxmi Hotel — Point of Sale & Restaurant Management System

> **Internal restaurant POS and management system for Mahalaxmi Hotel, Ispurli, Maharashtra.**
> This is a real production-oriented application, not a demo or tutorial project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [Prerequisites](#5-prerequisites)
6. [Local PostgreSQL Setup](#6-local-postgresql-setup)
7. [Environment Variables](#7-environment-variables)
8. [Running the Backend](#8-running-the-backend)
9. [Running the Frontend](#9-running-the-frontend)
10. [Database Migrations](#10-database-migrations)
11. [Creating a Development Admin](#11-creating-a-development-admin)
12. [How Authentication Works](#12-how-authentication-works)
13. [API Endpoints](#13-api-endpoints)
14. [Running Tests](#14-running-tests)
15. [Security Considerations](#15-security-considerations)
16. [Token Storage Decision](#16-token-storage-decision)
17. [Stage 1 Scope](#17-stage-1-scope)
18. [Future Stages](#18-future-stages)
19. [Docker (Optional)](#19-docker-optional)

---

## 1. Project Overview

Mahalaxmi POS is a Point of Sale and restaurant management system designed for Mahalaxmi Hotel, Ispurli, Maharashtra.

The system is being built in controlled stages:

| Stage | Scope | Status |
|-------|-------|--------|
| Stage 1 | Foundation + Authentication | ✅ Complete |
| Stage 2 | Menu + Order Taking | Planned |
| Stage 3 | Billing + Payment + Printing | Planned |
| Stage 4 | Admin + Reports + Restaurant Operations | Planned |
| Stage 5 | Production Hardening | Planned |

This document covers **Stage 1** only.

---

## 2. Architecture

The system is a **modular monolith** — one deployable backend, one deployable frontend, one database.

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         React + Vite + TypeScript + Tailwind         │
│           Deployed on: Vercel                        │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS + REST
┌────────────────────▼─────────────────────────────────┐
│                    BACKEND                           │
│       Java 17 + Spring Boot + Spring Security        │
│              JWT Authentication                      │
│           Deployed on: Render                        │
└────────────────────┬─────────────────────────────────┘
                     │ JDBC
┌────────────────────▼─────────────────────────────────┐
│                   DATABASE                           │
│              PostgreSQL (Managed)                    │
└──────────────────────────────────────────────────────┘
```

### Backend Package Organization

The backend uses **feature-oriented packaging**, not a flat layer-based structure:

```
com.mahalaxmi.pos/
├── auth/           ← Authentication feature (controller, service, dto, filter)
├── user/           ← User domain (entity, repository, service, dto)
├── common/         ← Shared utilities (exceptions, response models, validation)
└── config/         ← Application configuration (security, CORS, OpenAPI, seeding)
```

This makes it straightforward to add new features (menu, orders, billing) as isolated modules in later stages.

---

## 3. Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.2.x | Application framework |
| Spring Security | (via Boot) | Authentication & authorization |
| Spring Data JPA | (via Boot) | Database access |
| PostgreSQL | 15+ | Primary database |
| Flyway | 9.x | Database migrations |
| JJWT | 0.12.x | JWT token generation & validation |
| Bean Validation | (Jakarta) | Input validation |
| Lombok | Latest | Boilerplate reduction |
| springdoc-openapi | 2.x | API documentation (Swagger UI) |
| SLF4J / Logback | (via Boot) | Logging |
| JUnit 5 + Mockito | (via Boot) | Testing |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Styling |
| React Router | 6 | Client-side routing |
| Axios | 1.x | HTTP client |
| Vitest | 1.x | Testing |
| Testing Library | 14.x | Component testing |

---

## 4. Repository Structure

```
mahalaxmi-pos/
│
├── backend/                        ← Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mahalaxmi/pos/
│   │   │   │   ├── PosApplication.java
│   │   │   │   ├── auth/           ← Authentication feature
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── filter/
│   │   │   │   │   └── service/
│   │   │   │   ├── user/           ← User domain
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── service/
│   │   │   │   ├── common/         ← Shared components
│   │   │   │   │   ├── exception/
│   │   │   │   │   └── response/
│   │   │   │   └── config/         ← Configuration
│   │   │   │       └── security/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── db/migration/   ← Flyway migrations
│   │   └── test/
│   ├── .env.example
│   └── pom.xml
│
├── frontend/                       ← React application
│   ├── src/
│   │   ├── app/                    ← App root + router
│   │   ├── features/
│   │   │   └── auth/               ← Auth feature (context, tests)
│   │   ├── components/             ← Shared components
│   │   │   └── ui/
│   │   ├── layouts/                ← Page layouts (dashboard shell)
│   │   ├── pages/                  ← Page components
│   │   ├── services/               ← API client + service layer
│   │   ├── types/                  ← TypeScript types
│   │   ├── styles/                 ← Global CSS
│   │   └── test/                   ← Test setup
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                           ← Documentation
├── .gitignore
└── README.md                       ← This file
```

---

## 5. Prerequisites

Before running locally, ensure you have:

| Requirement | Version | Check |
|---|---|---|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| PostgreSQL | 14+ | `psql --version` |

---

## 6. Local PostgreSQL Setup

Create a database for development:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE mahalaxmi_pos;

-- Create a dedicated user (recommended)
CREATE USER mahalaxmi_user WITH PASSWORD 'your_dev_password';
GRANT ALL PRIVILEGES ON DATABASE mahalaxmi_pos TO mahalaxmi_user;
```

Or using the command line:
```bash
createdb -U postgres mahalaxmi_pos
```

**Note**: Flyway will automatically create and manage all tables on startup. You do not need to create tables manually.

---

## 7. Environment Variables

### Backend

Copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/mahalaxmi_pos` |
| `DB_USERNAME` | Database username | `mahalaxmi_user` |
| `DB_PASSWORD` | Database password | `your_dev_password` |
| `JWT_SECRET` | JWT signing secret (base64, min 64 chars) | See note below |
| `JWT_EXPIRATION_MS` | Token expiry in ms | `86400000` (24h) |
| `CORS_ALLOWED_ORIGIN` | Frontend origin | `http://localhost:5173` |
| `DEV_SEED` | Create default admin on startup | `true` (dev only) |
| `DEV_ADMIN_PASSWORD` | Dev admin password | `Admin@123` (dev only) |

**Generating a JWT secret:**
```bash
# Generate a strong base64-encoded secret:
openssl rand -base64 64
```

> ⚠️ **NEVER commit the filled `.env` file. The `.env.example` file contains only placeholders.**

### Frontend

Copy the example file:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |

---

## 8. Running the Backend

### Option A: Using Maven (recommended for development)

```bash
cd backend

# Set environment variables (Linux/macOS)
export DB_URL=jdbc:postgresql://localhost:5432/mahalaxmi_pos
export DB_USERNAME=mahalaxmi_user
export DB_PASSWORD=your_dev_password
export JWT_SECRET=your_base64_encoded_secret
export JWT_EXPIRATION_MS=86400000
export CORS_ALLOWED_ORIGIN=http://localhost:5173
export DEV_SEED=true
export DEV_ADMIN_PASSWORD=Admin@123

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Windows (PowerShell):**
```powershell
cd backend

$env:DB_URL="jdbc:postgresql://localhost:5432/mahalaxmi_pos"
$env:DB_USERNAME="mahalaxmi_user"
$env:DB_PASSWORD="your_dev_password"
$env:JWT_SECRET="your_base64_encoded_secret"
$env:JWT_EXPIRATION_MS="86400000"
$env:CORS_ALLOWED_ORIGIN="http://localhost:5173"
$env:DEV_SEED="true"
$env:DEV_ADMIN_PASSWORD="Admin@123"

mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The backend starts at: **http://localhost:8080**

### Swagger UI
Available at: **http://localhost:8080/swagger-ui.html**

---

## 9. Running the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and set VITE_API_BASE_URL=http://localhost:8080

# Start development server
npm run dev
```

The frontend starts at: **http://localhost:5173**

---

## 10. Database Migrations

Flyway runs automatically when the Spring Boot application starts.

Migrations are located at:
```
backend/src/main/resources/db/migration/
```

Migration files follow the naming convention: `V{version}__{description}.sql`

| File | Description |
|---|---|
| `V1__init_auth_schema.sql` | Initial schema: `users` table |

**To validate migrations without starting the app:**
```bash
cd backend
mvn flyway:info
```

---

## 11. Creating a Development Admin

When `DEV_SEED=true` is set and the application profile is not `prod`, the application will automatically create a default admin user on startup **if no admin user exists**.

Default dev credentials:
- **Username**: `admin`
- **Email**: `admin@mahalaxmi.com`
- **Password**: value of `DEV_ADMIN_PASSWORD` env var (default: `Admin@123`)
- **Role**: `ADMIN`

> ⚠️ **IMPORTANT**: These credentials are for local development ONLY.
> Never use these credentials in production.
> Change the password immediately in any non-development environment.
> The seeder is disabled in the `prod` Spring profile.

---

## 12. How Authentication Works

```
1. User submits credentials (usernameOrEmail + password)
        │
        ▼
2. POST /api/v1/auth/login
        │
        ▼
3. Backend:
   - Looks up user by username OR email
   - Verifies BCrypt password hash
   - Checks account is enabled
   - Generates JWT (HMAC-SHA256)
   - JWT claims: sub=username, role=ROLE_ADMIN/ROLE_STAFF, iat, exp
        │
        ▼
4. Response: { accessToken, tokenType, expiresIn, user }
        │
        ▼
5. Frontend stores token in memory (tokenStore)
        │
        ▼
6. Subsequent API requests attach: Authorization: Bearer <token>
        │
        ▼
7. JwtAuthenticationFilter validates token on every protected request
   - Extracts username from JWT
   - Loads UserDetails from database
   - Validates token signature + expiry
   - Sets SecurityContext if valid
        │
        ▼
8. Spring Security enforces authorization rules
```

### JWT Structure

The JWT contains:
- `sub`: username
- `role`: user's granted authority (e.g., `ROLE_ADMIN`)
- `iat`: issued at (Unix timestamp)
- `exp`: expiry (Unix timestamp)

The JWT does **NOT** contain: password, password hash, email, or any sensitive data.

---

## 13. API Endpoints

### Stage 1 Endpoints

| Method | Path | Auth Required | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | None | Login |
| `GET` | `/api/v1/auth/me` | Yes | Any | Get current user |

### Request / Response Examples

**POST /api/v1/auth/login**

Request:
```json
{
  "usernameOrEmail": "admin",
  "password": "Admin@123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@mahalaxmi.com",
      "role": "ADMIN",
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00"
    }
  }
}
```

**GET /api/v1/auth/me** (requires `Authorization: Bearer <token>`)

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@mahalaxmi.com",
    "role": "ADMIN",
    "enabled": true,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

**Error responses:**
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "path": "/api/v1/auth/login"
}
```

---

## 14. Running Tests

### Backend Tests

```bash
cd backend
mvn test
```

Tests use H2 in-memory database — no PostgreSQL required for testing.

Test coverage:
- `AuthIntegrationTest`: Full HTTP integration tests (login, /me, auth failures)
- `AuthServiceTest`: Unit tests for AuthService with Mockito
- `JwtServiceTest`: Unit tests for JWT generation and validation

### Frontend Tests

```bash
cd frontend
npm run test:run
```

Test coverage:
- `LoginPage.test.tsx`: Login form behavior, validation, API errors
- `ProtectedRoute.test.tsx`: Route protection behavior

---

## 15. Security Considerations

| Area | Implementation |
|---|---|
| **Passwords** | BCrypt hashing (strength 10). Plaintext passwords never stored or logged. |
| **JWT** | HMAC-SHA256 signed. Secret from environment variable only. |
| **Token expiry** | Configurable via `JWT_EXPIRATION_MS` (default 24h). |
| **Authorization** | Role-based. `ADMIN` and `STAFF` have different privilege levels. |
| **CORS** | Restricted to configured frontend origin only. No wildcard (`*`) in production. |
| **CSRF** | Not needed (stateless JWT API, no cookie-based session). |
| **Input validation** | Server-side validation on all API inputs. |
| **Error responses** | No stack traces, SQL errors, or internal details exposed in responses. |
| **Logging** | Passwords and tokens are never logged. |
| **Session** | Stateless. No server-side session. |
| **Environment** | All secrets from environment variables. No hardcoded secrets. |

---

## 16. Token Storage Decision

### Decision: In-Memory Token Storage

The access token is stored in JavaScript memory (a module-scoped variable), not in `localStorage` or `sessionStorage`.

**Security rationale:**

| Approach | XSS Risk | CSRF Risk | Survives Refresh | Decision |
|---|---|---|---|---|
| localStorage | High (XSS reads it) | Low | Yes | ❌ Rejected |
| sessionStorage | High (XSS reads it) | Low | No | ❌ Rejected |
| HttpOnly Cookie | Low | Medium (mitigated by SameSite) | Yes | ✅ Alternative |
| **In-memory** | **Low** (XSS cannot read it) | Low | **No** | **✅ Chosen** |

**Trade-off**: The token is lost on page refresh. This means the user needs to log in again after a browser refresh in Stage 1.

**Planned improvement** (Stage 5 or before): Implement a refresh token strategy with HttpOnly cookies. The short-lived access token stays in memory; a long-lived refresh token is stored in an HttpOnly cookie. This provides both security and persistence.

**For a restaurant POS context**, page refresh is uncommon during active operation. Staff log in at shift start and use the system continuously. This trade-off is acceptable for Stage 1.

---

## 17. Stage 1 Scope

Stage 1 implements exactly:

✅ Spring Boot application with Maven  
✅ PostgreSQL database with Flyway migrations  
✅ User entity with BCrypt password hashing  
✅ ADMIN and STAFF roles  
✅ JWT-based authentication  
✅ Spring Security with stateless configuration  
✅ CORS configuration  
✅ Global exception handling  
✅ Input validation  
✅ Consistent API response structure  
✅ `POST /api/v1/auth/login` endpoint  
✅ `GET /api/v1/auth/me` endpoint  
✅ OpenAPI / Swagger documentation  
✅ SLF4J/Logback logging  
✅ Development data seeder (admin user)  
✅ Backend unit + integration tests  
✅ React + Vite + TypeScript + Tailwind CSS  
✅ React Router with protected routes  
✅ Centralized API client (Axios)  
✅ AuthContext with auth state  
✅ Professional login page  
✅ Dashboard shell with sidebar navigation  
✅ Frontend tests  
✅ Environment variable configuration  
✅ `.env.example` files  
✅ `.gitignore`  
✅ README  

**NOT implemented in Stage 1** (by design):  
❌ Menu management  
❌ Order taking  
❌ Billing  
❌ Payments  
❌ Printing  
❌ Reports  
❌ Kitchen display  
❌ Table management  
❌ Inventory  

---

## 18. Future Stages

| Stage | Modules |
|---|---|
| **Stage 2** | MenuCategory, MenuItem, Order, OrderItem — Fast POS screen |
| **Stage 3** | Bill, Payment (Cash/UPI/Card), Invoice, Printing |
| **Stage 4** | Admin panel, Staff management, Daily/Monthly reports |
| **Stage 5** | Production hardening, security audit, performance, monitoring |

**Planned deployment:**
- Frontend: `mahalaxmi-pos.vercel.app`
- Backend: `mahalaxmi-api.onrender.com`
- Database: Managed PostgreSQL

---

## 19. Docker (Optional)

For development, a PostgreSQL container can be used instead of a local installation.

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mahalaxmi_pos
      POSTGRES_USER: mahalaxmi_user
      POSTGRES_PASSWORD: dev_password_only
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start:
```bash
docker-compose up -d
```

Then set your backend env vars to match:
```
DB_URL=jdbc:postgresql://localhost:5432/mahalaxmi_pos
DB_USERNAME=mahalaxmi_user
DB_PASSWORD=dev_password_only
```

> Docker is not required. Use a local PostgreSQL installation if preferred.

---

*Mahalaxmi Hotel POS — Stage 1 — Foundation + Authentication*
