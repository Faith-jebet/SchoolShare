<div align="center">
<img width="1200" height="300" alt="SomaLink Banner" src="assets/banner.png" />
</div>

# SomaLink — Local Development

This repository contains a small full-stack React + Express + Vite app used as a simulated Kenyan CBC school supplies marketplace and AI parser.

This README documents how to run the app locally, common troubleshooting steps (Windows/OneDrive), and quick API endpoints you can call while developing.

## Prerequisites
- Node.js 18+ (Node 22 used in development)
- npm (bundled with Node) or an equivalent package manager
- Recommended: work outside OneDrive or synced folders to avoid file-lock issues on Windows

## Quick start (development)
1. Install dependencies

```bash
npm install
```

2. Copy environment example and set secrets (optional)

```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY if you plan to use Gemini features
```

3. Run development server

```bash
npm run dev
```

The full-stack server listens on http://localhost:3000 by default. The front-end is served through Vite middleware.

## Useful commands
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (runs `tsx server.ts`)
- Build for production: `npm run build`
- Start built server: `npm run start`
- Type-check / lint: `npm run lint` (runs `tsc --noEmit`)

## API endpoints (development)
- `GET /api/health` — simple health check
- `GET /api/materials` — list of catalog materials
- `GET /api/suppliers` — supplier list
- `GET /api/orders` — orders (supports `?phone=` filter)
- `POST /api/orders` — create an order
- `POST /api/orders/:id/mpesa-pay` — simulate M-Pesa payment
- `GET /api/custom-requests` — custom sourcing requests
- `POST /api/gemini/parse` — AI parsing endpoint (requires GEMINI_API_KEY)

## Environment variables
- `GEMINI_API_KEY` — (optional) Google Gemini API key used by the AI parsing endpoint. If not provided, the server will fall back to a local heuristic parser.

## Troubleshooting

1) Port 3000 already in use

PowerShell (stop processes using port 3000):

```powershell
$pids = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force } }
```

2) npm/esbuild/locked binary issues on Windows (OneDrive)

- If you see errors installing native binaries (esbuild) or EBUSY/EPERM, try moving the project out of OneDrive to a normal folder (e.g., `C:\projects\Ai-Kenya`) then:

```powershell
# from project root
npm cache clean --force
Remove-Item -Recurse -Force node_modules,package-lock.json
npm install
```

Or on macOS / Linux:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

3) Missing TypeScript types / JSX errors

If TS reports missing React types or JSX bindings, install dev types:

```bash
npm install --save-dev @types/react @types/react-dom
```

4) If you encounter strange nested package resolution errors (missing `debug` or similar), a fresh reinstall usually helps:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Notes for contributors
- Keep Node and npm up-to-date.
- Avoid editing compiled/bundled files in `dist/` — edit source files in `src/`.

## Where to look next
- Server entry: `server.ts`
- Frontend entry: `src/main.tsx` and `src/App.tsx`
- Types: `src/types.ts`

---

If you'd like, I can open the app in your browser or run a quick smoke test (create an order via the API). See [README.md](README.md) for these instructions.

