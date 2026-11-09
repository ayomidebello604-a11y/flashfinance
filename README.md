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

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Supabase
- Tailwind CSS
- shadcn/ui and Radix UI
- Recharts
- Framer Motion
- Vitest

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone https://github.com/ayomidebello604-a11y/flashfinance.git
cd flashfinance
npm install
```

### Environment Variables

Create a `.env` file in the project root and provide the Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the publishable/anonymous client key intended for browser applications. Do not put a Supabase service-role key in frontend environment variables.

### Run Locally

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
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
