**Stack used:**

**Frontend (`index.html`)**
- Plain HTML/CSS/JS — no framework
- `fetch()` — talk to backend API

**Backend (`server.js`)**
- `express` — HTTP server + routing
- `cors` — allow frontend to call backend
- `dotenv` — load `.env` secrets
- `pg` (node-postgres) — talk to PostgreSQL

**Database**
- PostgreSQL — store tasks
- `tasks` table — id, title, done, priority, created_at

**Dev tool**
- `nodemon` — auto-restart server on file change

**Config**
- `.env` — keep DB creds out of code

That it. 6 npm packages total: `express`, `cors`, `pg`, `dotenv`, `nodemon`, `uv` (Python tool — not needed, ignore it).
