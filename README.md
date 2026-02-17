# Planit MVP - Codice sorgente modulare

API backend TypeScript/Express per l'MVP descritto nei documenti di prodotto.

## Struttura

- `src/domain`: tipi e modelli dominio.
- `src/repositories`: persistenza JSON file-based (default `./data/events-store.json`).
- `src/services`: business logic (create/join/vote/close).
- `src/routes`: endpoint HTTP.
- `src/shared`: errori condivisi.
- `test`: test API end-to-end con supertest.

## Endpoint principali

- `POST /api/v1/events`
- `POST /api/v1/events/join`
- `POST /api/v1/events/:eventId/votes` (richiede header `Authorization`)
- `POST /api/v1/events/:eventId/close` (richiede token host in `Authorization`)
- `GET /api/v1/events/:eventId`
- `GET /api/v1/openapi`
- `GET /metrics`

Sono mantenuti anche gli endpoint legacy sotto `/api/*` per backward compatibility.

## Avvio

```bash
npm install
npm run dev
```

## Variabili ambiente

- `PORT` (default: `3000`)
- `DATA_FILE_PATH` (default: `./data/events-store.json`)
