# AI Agent Marketplace (WhatsApp Chatbot Prototype)

This project now includes a complete prototype flow where a shop owner fills a simple onboarding form and gets a ready WhatsApp chatbot profile generated and saved in MongoDB.

## Tech stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

## What the new feature does

Using the `Setup Wizard` page, a shop owner can submit:

- shop details
- business type and timings
- WhatsApp number
- services offered

The backend creates and stores:

- chatbot receptionist name
- welcome message
- quick reply templates
- fallback message
- generated prompt for a 24x7 receptionist chatbot

It also now includes a **chatbot simulation brain** for prototype demos:

- intent-style knowledge matching (services, pricing, timing, booking, location)
- confidence score + intent labels
- in-memory conversation memory per customer session
- lead-field capture (name/phone/requirement)
- escalation behavior for urgent complaints

Brain mode behavior:

- `rules`: local intent engine only (fast, deterministic)
- `gemini`: Gemini-generated replies
- `hybrid`: Gemini reply with rule-engine grounding and automatic fallback

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Add environment file

Create `.env` in project root using `.env.example`:

```bash
cp .env.example .env
```

Update `MONGODB_URI` if your MongoDB is not local.

### 2.1) (Optional) Enable Gemini brain

In your root `.env` file, add:

```bash
# rules | gemini | hybrid
BRAIN_MODE=hybrid

# Your key from Google AI Studio
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Optional model override
GEMINI_MODEL=gemini-2.0-flash
```

Where to add API key: `PROJECT_ROOT/.env` (same file where `MONGODB_URI` is configured).

### 3) Ensure MongoDB is running

Use local MongoDB service or MongoDB Atlas connection string.

### 4) Run app (frontend + backend)

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

## API endpoints

- `POST /api/onboarding` → create chatbot setup
- `GET /api/onboarding/:id` → fetch saved setup
- `POST /api/chatbots/:id/simulate` → simulate customer question and chatbot response
- `GET /api/health` → health check

### Simulation request example

`POST /api/chatbots/:id/simulate`

```json
{
	"customerPhone": "+919999999999",
	"customerName": "Rahul",
	"question": "What are your timings and can I book for tomorrow?"
}
```

## Manual steps required for real WhatsApp go-live

This prototype generates the chatbot configuration. To make it live on WhatsApp for real users, you must manually connect:

1. WhatsApp Business API provider (Meta Cloud API / Twilio / Gupshup / Interakt)
2. Webhook endpoint in backend to receive incoming WhatsApp messages
3. Message sending API call from backend to WhatsApp provider
4. Deploy backend to a public HTTPS server
5. Store provider credentials in environment variables securely

## Suggested next improvements

- Add authentication for shop owners
- Add dashboard to edit chatbot responses after onboarding
- Integrate OpenAI/Gemini API for dynamic conversation replies
- Add webhook logs + message analytics

