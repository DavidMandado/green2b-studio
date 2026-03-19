# Green2B Studio

Green2B Studio is a local prototype for a student consulting team working with Green2B. It combines:

- market research and country prioritization
- supplier and product database management
- transparent sustainability scoring
- buyer-facing product comparison
- analyst-facing scoring configuration
- a pipeline demo and request-template generator

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- React Hook Form + Zod
- Recharts
- TanStack Table
- Vitest

## Key Routes

- `/dashboard`
- `/research/countries`
- `/research/interviews`
- `/research/competitors`
- `/research/regulations`
- `/suppliers`
- `/suppliers/[id]`
- `/products`
- `/products/[id]`
- `/compare`
- `/pipeline`
- `/settings/scoring`
- `/reports/summary`

## Local Development

Install dependencies if needed:

```bash
npm install
```

Push the schema and seed the SQLite database:

```bash
npm run db:push
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Run verification:

```bash
npm run test
npm run build
```

## Data Model Highlights

- `CountryResearch`
- `BuyerInterview`
- `Competitor`
- `RegulationNote`
- `Supplier`
- `Product`
- `Evidence`
- `Benchmark`
- `ScoringConfig`
- `AppState`

## Scoring Logic

The scoring engine combines:

- 7 weighted sustainability pillars
- a separate confidence score
- missing-data penalties capped at 25
- grade mapping from A to E
- status mapping: Verified, Provisional, Insufficient Data

The core implementation lives in:

- `src/lib/scoring/defaults.ts`
- `src/lib/scoring/engine.ts`

## Seeded Prototype Content

- 4 countries
- 8 buyer interviews
- 6 competitors
- 12 regulation notes
- 6 suppliers
- 12 products
- 26 evidence records
- category benchmarks and default scoring config

## Notes

- This is a prototype, not a production system.
- All seeded research and regulatory content is fictional demo content.
- No external APIs or authentication are required.
