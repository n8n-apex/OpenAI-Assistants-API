# Assistants API Chat Widget

## Setup
1. Install dependencies:
   ```bash
   npm install express node-fetch dotenv cors
   ```
2. Create `.env`:
   ```env
   OPENAI_API_KEY=your_openai_key
   ASSISTANT_ID=your_assistant_id
   AUTH_TOKEN=changeme
   PUBLIC_ORIGIN=http://localhost:5500
   ```
3. Run server:
   ```bash
   node server.js
   ```
4. Serve `frontend/` via static hosting or CMS.

## Embed
Add the `frontend/` HTML/CSS/JS to your website and adjust `API_URL` + `AUTH_TOKEN`.
