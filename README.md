# FlashFinance

FlashFinance is a React-based financial research dashboard designed to bring stock research, market context, strategy planning, sentiment, and risk analysis into one interface.

## Features

The application includes dedicated areas for:

- Dashboard overview
- Stock research
- Investment strategy
- Market news
- Sentiment analysis
- Risk analysis
- Stock assistant
- Account authentication and settings

Authenticated application routes are protected, and user/profile authentication is integrated with Supabase. The interface also includes theme persistence and reusable UI components.

## Tech Stack

- React 19
- TypeScript 7
- Vite 8
- React Router
- TanStack Query
- Supabase
- Tailwind CSS 4
- shadcn/ui and Radix UI
- Recharts
- Framer Motion
- Vitest 5

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
git clone https://github.com/ayomidebello604-a11y/flashfinance.git
cd flashfinance
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_google_gemini_api_key
FINNHUB_API_KEY=your_finnhub_api_key
```

Use the publishable/anonymous client key intended for browser applications. Do not put a Supabase service-role key in frontend environment variables.
Keep `GEMINI_API_KEY` server-side; it is used by the Vercel `/api/ai` function and must not use a `VITE_` prefix. Add the same `GEMINI_API_KEY` to the Vercel project's Environment Variables for deployments. The app defaults to `gemini-3.5-flash-lite`; you can optionally set `GEMINI_MODEL` to another model available to your Google AI Studio key.
`FINNHUB_API_KEY` is used by the server-side `/api/market` function for quotes, intraday candles, market status, and news. Add it to the Vercel project's Environment Variables as well. Existing local `.env` files using `VITE_FINNHUB_API_KEY` remain supported, but the server-only name is recommended.
The `/api/ai` endpoint is reachable by app clients. Restrict the Gemini key to the Generative Language API, set usage quotas, and configure Vercel rate limits for production.

AI research, strategy, sentiment, risk, and assistant features use Gemini through `/api/ai`. The News page and dashboard market feeds use Finnhub through `/api/market`; stock research and strategy pages show Finnhub quotes, and sector performance is represented by sector ETFs. Dashboard sentiment and topics are derived from current provider headlines. Data freshness and endpoint availability depend on the Finnhub account plan.

For local development, add the keys to `.env` and run `npm run dev`. The Vite development server exposes `/api/ai` and `/api/market` locally.

### Run Locally

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

The production build includes the Vite frontend bundle in `dist/assets` and emits the source modules individually under `dist/src`. The `/api/ai` and `/api/market` Vercel functions use the emitted server modules.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the frontend bundle and emit each `src` TypeScript file as JavaScript under `dist/src` |
| `npm run build:dev` | Build using development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Application Routes

| Route | Area |
| --- | --- |
| `/auth` | Authentication |
| `/` | Dashboard |
| `/research` | Stock research |
| `/strategy` | Strategy |
| `/news` | News |
| `/sentiment` | Sentiment |
| `/risk` | Risk analysis |
| `/assist` | Stock assistant |
| `/settings` | Settings |

The dashboard routes are wrapped in the application's protected-route and shared-layout components.

## Project Structure

- `src/pages/` — application pages
- `src/components/` — shared and feature UI components
- `src/contexts/` — application context, including authentication
- `src/integrations/supabase/` — Supabase client and generated database types
- `src/hooks/` — reusable React hooks

## Disclaimer

FlashFinance is a software project for financial research and analysis. Its information and tools should not be treated as personalized financial advice.
