# AI Study Buddy

Upload your notes (PDF or pasted text) and get AI-generated quizzes, flashcards,
a weak-topic analytics dashboard, and a chat assistant grounded in your own notes
to guide your revision.

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens), bcryptjs
- **AI:** Google Gemini API
- **Validation:** Zod

## Project status

- [x] Phase 1 — Auth + document upload (PDF/text extraction)
- [x] Phase 2 — AI quiz generation
- [x] Phase 3 — Weak-topic analytics dashboard
- [x] Phase 4 — Flashcards + spaced repetition
- [x] Phase 5 — Chat with your notes (RAG)

## Project structure

```
server/   Express API, MongoDB models, auth, PDF parsing, AI integration
client/   React frontend (Vite + Tailwind)
```

## Setup

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local instance, Docker, or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A free [Google Gemini API key](https://aistudio.google.com/apikey) (no billing required, needed from Phase 2 onward)

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, GEMINI_API_KEY
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults to http://localhost:5000/api
npm run dev
```

Runs on `http://localhost:5173`.

## Deployment (free tier)

This app runs entirely on free tiers: **MongoDB Atlas** (database), **Render** (backend),
and **Vercel** (frontend).

### 1. Database — MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP address `0.0.0.0/0` (allow from anywhere — Render's free tier has no static IP).
4. **Connect** → **Drivers** → copy the `mongodb+srv://...` connection string. Insert your password
   and add the database name before the `?`, e.g.:
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ai-study-buddy?retryWrites=true&w=majority`

### 2. Backend — Render

1. Create a free account at [render.com](https://render.com) and sign in with GitHub.
2. **New** → **Blueprint** → select this repo. Render will read [render.yaml](render.yaml) and
   pre-fill the service (root dir `server`, build/start commands, free plan).
   (No blueprint support? Create a **Web Service** manually with the same settings.)
3. Fill in the environment variables it asks for: `MONGO_URI` (from step 1), `JWT_ACCESS_SECRET`
   and `JWT_REFRESH_SECRET` (any long random strings), `GEMINI_API_KEY`. Leave `CLIENT_URL` blank
   for now — you'll set it after deploying the frontend.
4. Deploy and note the resulting URL, e.g. `https://ai-study-buddy-api.onrender.com`.

Render's free plan spins the service down after 15 minutes of inactivity — the first request
after idle takes 30–50s to wake up. Fine for a portfolio demo, worth knowing about beforehand.

### 3. Frontend — Vercel

1. Create a free account at [vercel.com](https://vercel.com) and sign in with GitHub.
2. **New Project** → import this repo → set **Root Directory** to `client` (Vite is auto-detected).
3. Add environment variable `VITE_API_URL` = `https://ai-study-buddy-api.onrender.com/api`
   (your Render URL from step 2, with `/api` appended).
4. Deploy and note the resulting URL, e.g. `https://ai-study-buddy.vercel.app`.

### 4. Connect the two

Go back to the Render service → environment variables → set `CLIENT_URL` to your Vercel URL
(step 3). Render redeploys automatically and CORS will allow requests from the live frontend.

## API

| Method | Route                          | Auth | Description                             |
| ------ | ------------------------------ | ---- | ---------------------------------------- |
| POST   | /api/auth/signup               | No   | Create an account                        |
| POST   | /api/auth/login                | No   | Log in                                   |
| POST   | /api/auth/refresh              | No   | Exchange a refresh token for new pair    |
| POST   | /api/auth/logout               | Yes  | Invalidate the refresh token             |
| GET    | /api/auth/me                   | Yes  | Current user                             |
| POST   | /api/documents                 | Yes  | Upload a PDF or paste text               |
| GET    | /api/documents                 | Yes  | List your documents                      |
| GET    | /api/documents/:id             | Yes  | Get one document                         |
| POST   | /api/documents/:id/generate-quiz | Yes | Generate a 10-question quiz (Gemini). Body `{ focusWeakTopics: true }` targets this document's weak topics with harder questions |
| GET    | /api/documents/:id/questions   | Yes  | Get the current quiz questions (no answers) |
| POST   | /api/quiz/:documentId/submit   | Yes  | Submit answers, get scored, save attempt |
| GET    | /api/analytics/weak-topics     | Yes  | Accuracy % per topic across all attempts, weakest first |
| GET    | /api/analytics/score-trend     | Yes  | Score % per attempt over time, oldest first |
| POST   | /api/documents/:id/flashcards  | Yes  | Create flashcards from this document's current quiz questions |
| GET    | /api/flashcards/due            | Yes  | Flashcards due for review right now (across all documents) |
| POST   | /api/flashcards/:id/review     | Yes  | Body `{ correct: boolean }` — updates Leitner box and next review date |
| POST   | /api/documents/:id/chat        | Yes  | Body `{ question: string }` — RAG answer grounded in this document's notes |
| POST   | /api/assistant/chat            | Yes  | Body `{ question: string }` — general in-app help assistant (not document-grounded) |

## Screenshots

_Add screenshots here once the UI is running._
