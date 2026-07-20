# Roam Nepal

A travel platform for discovering and sharing hidden gems in Nepal, connecting travelers through posts, reviews, favorites, and direct messaging.

## Stack

- **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT auth, bcrypt, multer (image uploads), nodemailer (password reset emails)
- **Frontend**: React (Vite), React Router, Axios, react-hot-toast, `@react-google-maps/api`

## Project structure

```
backend/     Express API server
  controller/  Route handlers
  model/       Database queries
  route/       Express routers
  middleware/  Auth (JWT) and file upload middleware
  dataBase/    Postgres connection pool
  test/        Jest + Supertest tests

frontend/frontend/   React app (Vite)
  src/pages/       Route-level page components
  src/component/   Shared/reusable components
  src/context/     React context (auth, theme)
  src/service/     API client (Api.jsx) and route guards
```

## Setup

### 1. Database

Create a PostgreSQL database and set up the following tables: `users`, `places`, `reviews`, `favorites`, `feedback`, `notifications`, `messages`. (There is no migration file yet — tables were created ad hoc during development. See each `model/*.js` file for the exact columns each table needs.)

### 2. Backend

```
cd backend
npm install
cp .envExample .env   # then fill in real values
npm run dev            # nodemon, restarts on change
# or: npm start
```

Required `.env` values:

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Postgres connection |
| `FRONTEND_URL` | Used to build password-reset links (e.g. `http://localhost:5173`) |
| `EMAIL_USER`, `EMAIL_APP_PASSWORD` | Gmail address + [App Password](https://myaccount.google.com/apppasswords) for sending password-reset emails. Leave blank to skip email sending (the reset flow still works via API, it just won't deliver an email). |

### 3. Frontend

```
cd frontend/frontend
npm install
npm run dev
```

Required `.env` values (`frontend/frontend/.env`):

| Variable | Purpose |
|---|---|
| `VITE_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key. Leave blank to skip map rendering — everything else works without it. |

## Tests

```
cd backend
npm test
```

## Notes

- Uploaded images are stored on disk under `backend/uploads/` and served at `/uploads/<filename>`.
- `node_modules` and `.env` files are gitignored — if you're pulling this repo after they were previously committed, run `git rm -r --cached <path>` once locally to clear stale tracked copies (already done upstream).
