# AI Agent Marketplace

React + Vite frontend with an Express + MongoDB backend for:

- WhatsApp chatbot onboarding
- authenticated shop-owner setup flows
- a web concierge bot with public share links
- local rule-based or Gemini-backed reply simulation

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the root environment file

```bash
cp .env.example .env
```

Recommended local `.env` values:

```bash
PORT=5001
HOST=0.0.0.0
CLIENT_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=ai_agent_marketplace

# Leave empty in local dev so Vite proxies /api to the backend.
VITE_API_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:5001

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RESET_TOKEN_TTL_MINUTES=15

# rules | gemini | hybrid
BRAIN_MODE=rules
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Start MongoDB

Use a local MongoDB instance or MongoDB Atlas.

### 4. Run the app

Frontend + backend together:

```bash
npm run dev
```

Frontend only:

```bash
npm run dev:client
```

Backend only:

```bash
npm run dev:server
```

Production frontend build:

```bash
npm run build
```

Backend production start:

```bash
npm start
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Health check: `http://localhost:5001/api/health`

## Deployment

### Vercel frontend

1. Import the repo into Vercel.
2. Use:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable:
   - `VITE_API_URL=https://your-render-backend.onrender.com`
4. Deploy. The included `vercel.json` rewrites SPA routes to `index.html`.
5. Make sure the Render backend CORS list includes the exact Vercel domain, for example:
   - `CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`

### Render backend

1. Create a new Web Service from this repo.
2. Use:
   - Build command: `npm install`
   - Start command: `npm run server`
3. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `HOST=0.0.0.0`
   - `MONGODB_URI=...`
   - `MONGODB_DB_NAME=ai_agent_marketplace`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=7d`
   - `RESET_TOKEN_TTL_MINUTES=15`
   - `BRAIN_MODE=rules` or `hybrid`
   - `GEMINI_API_KEY=...` if using Gemini
   - `CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com`
4. After Render assigns the public backend URL, set that URL in Vercel as `VITE_API_URL`.

The repository also includes a starter `render.yaml` if you want infrastructure-as-config.
