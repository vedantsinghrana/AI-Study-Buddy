# AI Study Buddy

Upload your notes (PDF or pasted text) and get AI-generated quizzes, flashcards,
and a weak-topic analytics dashboard to guide your revision.

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens), bcryptjs
- **AI:** Anthropic Claude API
- **Validation:** Zod

## Project status

- [x] Phase 1 — Auth + document upload (PDF/text extraction)
- [ ] Phase 2 — AI quiz generation
- [ ] Phase 3 — Weak-topic analytics dashboard
- [ ] Phase 4 — Flashcards + spaced repetition
- [ ] Phase 5 — Chat with your notes (RAG)

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
- An [Anthropic API key](https://console.anthropic.com/) (needed from Phase 2 onward)

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, ANTHROPIC_API_KEY
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

## API (Phase 1)

| Method | Route              | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------- |
| POST   | /api/auth/signup   | No   | Create an account                     |
| POST   | /api/auth/login    | No   | Log in                                |
| POST   | /api/auth/refresh  | No   | Exchange a refresh token for new pair |
| POST   | /api/auth/logout   | Yes  | Invalidate the refresh token          |
| GET    | /api/auth/me       | Yes  | Current user                          |
| POST   | /api/documents      | Yes  | Upload a PDF or paste text            |
| GET    | /api/documents      | Yes  | List your documents                   |
| GET    | /api/documents/:id  | Yes  | Get one document                      |

## Screenshots

_Add screenshots here once the UI is running._
