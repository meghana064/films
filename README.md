# Films - Movie Discovery App

Production-ready full-stack web application with React, Express, MySQL, and TMDB API integration.

## Tech Stack

- **Frontend:** React (Vite) + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MySQL (Aiven)
- **ORM:** Prisma
- **Auth:** JWT (access + refresh tokens), bcrypt
- **Movie API:** TMDB (proxied via backend)

## Prerequisites

- Node.js 18+
- MySQL database (Aiven free tier)
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

## Setup

### 1. Create Database

In Aiven Console, create a database named `films_db` (or use existing). Note: Some Aiven plans auto-create a default database.

### 2. Environment Variables

**Server** (`server/.env`):

```
PORT=5000
DB_HOST=your-aiven-host
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=films_db
DATABASE_URL="mysql://avnadmin:YOUR_PASSWORD@YOUR_HOST:PORT/films_db?sslaccept=strict"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
TMDB_API_KEY=your-tmdb-api-key
```

**Client** (`client/.env`):

```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Install & Run

```bash
# Install root deps
npm install

# Install server deps
cd server && npm install

# Generate Prisma client & push schema
cd server && npm run db:generate && npm run db:push

# Install client deps
cd client && npm install

# Run both (from root)
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Run Locally

```bash
# From project root
npm run dev
```

Or separately:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Run Tests

### Backend (Jest + Supertest)

```bash
cd server
npm test
```

Requires database connection. Tests cover:
- Auth: register, login, password hashing, JWT protection
- TMDB proxy: trending, top-rated, mocked API calls

### Frontend (Vitest + React Testing Library)

```bash
cd client
npm test
```

Tests cover:
- Registration/Login form render
- Redirect after registration/login
- Landing page dynamic movie data
- Protected route blocking unauthenticated users

## Deploy

### Backend (e.g. Railway, Render, Fly.io)

1. Set all env vars (DATABASE_URL, JWT_SECRET, TMDB_API_KEY, etc.)
2. Build: `cd server && npm install`
3. Start: `npm start`
4. Run migrations: `npx prisma db push`

### Frontend (e.g. Vercel, Netlify)

1. Set `VITE_API_BASE_URL` to your backend URL
2. Build: `cd client && npm run build`
3. Deploy `dist/` folder

### CORS

Set `CORS_ORIGIN` on backend to your frontend URL (e.g. `https://your-app.vercel.app`).

## Project Structure

```
/server
  /config      - DB, env
  /controllers - auth, movies
  /middleware  - auth, validation
  /routes      - auth, movie routes
  /tests       - Jest tests
  server.js

/client
  /src
    /components - ProtectedRoute, PublicRoute
    /pages      - Registration, Login, Landing
    /context    - AuthContext
    /services   - api
  /tests       - Vitest tests
```

## Application Flow

1. **Registration** (`/`) - Default first page
2. **Login** (`/login`) - After registration or direct
3. **Landing** (`/home`) - Netflix-style, protected

- Valid JWT → auto-redirect to `/home`
- Token expired → refresh token attempt → fail → redirect to `/login`
