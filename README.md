# SRH Ambassador

Monorepo for the SRH Ambassador platform.

| Folder | What it is |
|---|---|
| `srh-ambassador/` | Strapi 5 CMS (TypeScript, SQLite) — content types, permissions, demo seeding |
| `frontend/` | React + Vite + TypeScript app that consumes the Strapi API |
| `docs/` | Project documentation (ER models) |

## Running locally

Requires Node.js 20–24.

**Strapi CMS** (http://localhost:1337):

```bash
cd srh-ambassador
cp .env.example .env   # then fill in the secrets
npm install
npm run dev
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
cp .env.example .env   # VITE_API_URL points at Strapi
npm install
npm run dev
```

Start Strapi first — the frontend reads from its API.
