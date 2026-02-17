# Planit MVP - Codice sorgente modulare

API backend TypeScript/Express per l'MVP descritto nei documenti di prodotto.

## Struttura

- `src/domain`: tipi e modelli dominio.
- `src/repositories`: persistenza (in-memory, facilmente sostituibile con Supabase/Postgres).
- `src/services`: business logic (create/join/vote/close).
- `src/routes`: endpoint HTTP.
- `src/shared`: errori condivisi.
- `test`: test API end-to-end con supertest.

## Endpoint principali

- `POST /api/events`
- `POST /api/events/join`
- `POST /api/events/:eventId/votes`
- `POST /api/events/:eventId/close`
- `GET /api/events/:eventId`

## Avvio

```bash
npm install
npm run dev
```
