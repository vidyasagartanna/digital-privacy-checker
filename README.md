# Digital Privacy Checker (Frontend + Backend + AI Chatbot)

```
digital-privacy-checker/
├── backend/    Express + SQLite API  (POST /api/analyze, GET /api/history, POST /api/chat)
└── frontend/   React + Vite app with the floating "Ask AI" Privacy Assistant
```

## Run
1. Backend: `cd backend && npm install && npm start`  (http://localhost:5000)
2. Frontend: `cd frontend && npm install && npm run dev`

## Optional AI replies
Copy `backend/.env.example` to `backend/.env` and set `OPENAI_API_KEY`. Without a key the chatbot uses built-in privacy guidance. Keep keys on the backend only. Needs Node 18+.

The frontend reads the API address from `frontend/.env` (`VITE_API_URL`, default `http://localhost:5000`).

## Deploy to Render

The root `render.yaml` defines a free backend service and a static frontend. Push this repository to GitHub, then in Render choose **New + > Blueprint** and select the repository. Render will create both services and connect the frontend to the API automatically.

The free backend uses temporary storage for SQLite, so audit history can be lost when the service restarts. Add `OPENAI_API_KEY` to the backend service's Render environment variables only if you want AI-generated chatbot replies.
