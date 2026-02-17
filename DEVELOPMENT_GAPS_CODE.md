# Gap di sviluppo / codice (stato aggiornato)

## Implementato in questa iterazione

### 1) Sicurezza e autorizzazione
- Autorizzazione voto via header `Authorization` legato al token del partecipante.
- Chiusura evento consentita solo al token host.
- Errori applicativi con `code` esplicito (`INVALID_AUTH_TOKEN`, `HOST_AUTH_REQUIRED`, ...).

### 2) Regole di dominio
- Enforcement `closeAt` (auto-close evento quando scaduto).
- Join idempotente per stesso `guestName` nello stesso evento.
- Un voto attivo per partecipante/evento (nuovo voto sostituisce precedente).
- Tie-break deterministico: in parità vince etichetta opzione in ordine alfabetico.

### 3) Persistenza
- Repository non più solo in-memory: persistenza JSON su file (`DATA_FILE_PATH`).

### 4) Osservabilità/operatività
- Request ID (`X-Request-Id`), logging JSON per richiesta, metriche base (`/metrics`).
- Hardening base: security headers, CORS semplice, rate limiting in-memory.

### 5) Qualità e CI
- Script `typecheck` e `quality` in `package.json`.
- Workflow CI GitHub Actions con install, typecheck, build e test.

### 6) Contratto API e versioning
- API versionata `/api/v1` (legacy `/api` mantenuto).
- Endpoint `GET /api/v1/openapi` con specifica OpenAPI minimale.
- Error contract unificato: `{ code, message, requestId }`.

## Possibili miglioramenti futuri
- Migrare da file JSON a DB transazionale (Postgres/Supabase) con migration formali.
- Rate limiting distribuito (Redis) per ambienti multiistanza.
- OpenAPI completa con schema request/response dettagliati.
