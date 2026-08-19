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

## Screenshots

_Add screenshots here once the UI is running._
