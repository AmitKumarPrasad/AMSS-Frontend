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
