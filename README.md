# AMSS Frontend

Frontend application for the AMSS / EduSphere school management system.

## Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Zustand
- Vitest
- GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the AMSS backend URL.

## Delivery rule

Implementation → GitHub PR → CI → fix failures → GREEN → merge → next feature.


## Docker run

With the AMSS backend running on http://localhost:8080:

```bash
docker compose up -d --build
```

Open http://localhost:5173.

To point the frontend to a different API:

```bash
VITE_API_BASE_URL=https://your-api.example.com docker compose up -d --build
```
