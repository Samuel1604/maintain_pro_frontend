# MaintainPro Frontend

The MaintainPro frontend is a React and TypeScript operations portal for multi-tenant facility maintenance. It supports dashboards, facilities, locations, assets, service requests, work orders, preventive maintenance, inventory, vendors, marketplace workflows, reporting, and organization administration.

## Stack

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Axios

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

The development server runs at `http://localhost:3000` by default. The backend API normally runs at `http://localhost:8000`.

## Environment

Set `VITE_API_URL` in `.env` when the API is not available through the default local proxy. Do not commit `.env` or credentials.

Example:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run lint` | Run ESLint against the source tree |
| `npm test` | Run frontend contract and route tests |
| `npm run format` | Format frontend files with Prettier |
| `npm run format:check` | Verify Prettier formatting |
| `npm run audit:routes` | Verify portal navigation and route contracts |

## Project structure

```text
src/
├── api/                 # API clients, contracts, endpoints, and transport helpers
├── app/                 # Providers, routing, portal configuration, and access rules
├── components/          # Shared layout, navigation, feedback, and UI components
├── features/            # Domain pages, services, hooks, and feature components
├── hooks/               # Shared application hooks
├── realtime/            # Realtime connection and event handling
├── services/            # Cross-feature services
├── styles/              # Global and theme styles
├── types/               # Shared TypeScript types
└── utils/               # Formatting, identifiers, and shared helpers
```

The frontend is backend-driven: MongoDB identifiers remain API concerns, while user-facing references and names are normalized in the UI.

## Continuous integration

GitHub Actions runs formatting checks, linting, TypeScript checks, tests, route audits, and the production build for pushes and pull requests targeting `main`.

## Deployment

The project includes Vercel configuration for SPA routing. Configure `VITE_API_URL` in the deployment environment and ensure the backend allows the deployed frontend origin.

## License

ISC
