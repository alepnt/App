# MVP Architecture – Riduzione Decision Time

## 1) Diagramma testuale architettura (time-to-market)

```text
[Client Web/Mobile Web - Next.js]
  ├─ Pagine: Create Event, Vote Room, Result
  ├─ Stato locale: React Query/SWR + optimistic UI sul voto
  └─ Auth leggera: guest session + magic link host
          |
          v
[Backend BaaS - Supabase]
  ├─ Postgres (eventi, partecipanti, voti, decisione)
  ├─ RLS + ruoli (host, guest)
  ├─ Edge Functions:
  │    - closeDecision (manual/auto)
  │    - getRecommendations (venue base)
  │    - rate limiting semplice
  ├─ Realtime channels (aggiornamento voti live)
  └─ Cron/Scheduled job (chiusura automatica eventi scaduti)
          |
          +--> [Venue provider API opzionale]
          |      (es. Google Places/Foursquare: query top N)
          |
          +--> [PostHog]
                 (track funnel: create->join->vote->close)
```

### Responsabilità componenti
- **Next.js**: UX ultra rapida (crea evento in <60s, votazione 1 tap), rendering pagine, gestione link invito.
- **Supabase DB**: single source of truth per stato decisione.
- **Edge Functions**: logica server-side minima ma critica (chiusura deterministica, suggerimenti venue, anti-abuso).
- **Realtime**: mostrare progresso voti immediato per ridurre indecisione e rimbalzi chat.
- **PostHog**: misurare `Decision Time` (KPI principale) e drop-off di funnel.

---

## 2) Data model minimo (entità, relazioni, campi essenziali)

### Relazioni principali
- Un **event** ha un **host (user)**.
- Un **event** ha molti **participants**.
- Un **event** ha molte **options** (venue candidate).
- Un **participant** esprime al massimo un voto per **option**.
- Un **event** ha una **decision** finale (option vincente) quando chiuso.

### Tabelle schema dati

#### `users`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (pk) | id utente |
| email | text nullable | richiesto per host, opzionale guest |
| display_name | text | nome breve |
| created_at | timestamptz | default now() |

#### `events`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (pk) | id evento |
| host_user_id | uuid (fk users.id) | creatore |
| title | text | es. “Cena Team Giovedì” |
| description | text nullable | opzionale |
| status | text | `open` \| `closed` |
| close_at | timestamptz | chiusura automatica |
| invite_token_hash | text | hash token join link |
| winning_option_id | uuid nullable | valorizzato alla chiusura |
| created_at | timestamptz | default now() |
| closed_at | timestamptz nullable | audit |

#### `event_participants`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (pk) | |
| event_id | uuid (fk events.id) | |
| user_id | uuid nullable (fk users.id) | nullable per guest anonimo |
| guest_name | text nullable | fallback nome guest |
| role | text | `host` \| `guest` |
| joined_at | timestamptz | |
| unique_join_fingerprint | text nullable | anti-abuso leggero |

#### `event_options`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (pk) | |
| event_id | uuid (fk events.id) | |
| label | text | nome venue/opzione |
| source | text | `manual` \| `suggested` |
| metadata | jsonb nullable | indirizzo, lat/lng opzionale |
| created_at | timestamptz | |

#### `votes`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (pk) | |
| event_id | uuid (fk events.id) | denormalizzato per query rapide |
| option_id | uuid (fk event_options.id) | |
| participant_id | uuid (fk event_participants.id) | |
| score | smallint | 1=upvote (MVP) |
| created_at | timestamptz | |
| updated_at | timestamptz | per revote |

**Vincoli minimi consigliati**
- `unique(event_id, participant_id, option_id)` su `votes`.
- indice su `events(invite_token_hash)`, `events(status, close_at)`, `votes(event_id, option_id)`.
- check `close_at > created_at`.

---

## 3) API/Azioni principali (payload esempio)

> Approccio pragmatico: Next.js Route Handlers o Supabase Edge Functions.

### 3.1 `createEvent`
**POST** `/api/events`

Request:
```json
{
  "title": "Cena Team Giovedì",
  "description": "Post release",
  "closeAt": "2026-06-20T19:30:00Z",
  "options": ["Pizzeria Roma", "Sushi Zen"],
  "hostName": "Luca"
}
```

Response:
```json
{
  "eventId": "evt_123",
  "inviteLink": "https://app.planit.it/join/tkn_xxx",
  "status": "open"
}
```

### 3.2 `joinByLink`
**POST** `/api/events/join`

Request:
```json
{
  "inviteToken": "tkn_xxx",
  "guestName": "Sara"
}
```

Response:
```json
{
  "eventId": "evt_123",
  "participantId": "prt_456",
  "role": "guest",
  "status": "open"
}
```

### 3.3 `submitVote`
**POST** `/api/events/:eventId/votes`

Request:
```json
{
  "participantId": "prt_456",
  "optionId": "opt_1",
  "score": 1
}
```

Response:
```json
{
  "accepted": true,
  "totals": [
    {"optionId": "opt_1", "votes": 4},
    {"optionId": "opt_2", "votes": 3}
  ],
  "eventStatus": "open"
}
```

### 3.4 `closeDecision`
**POST** `/api/events/:eventId/close`

Request:
```json
{
  "actorParticipantId": "prt_host",
  "reason": "manual"
}
```

Response:
```json
{
  "eventId": "evt_123",
  "status": "closed",
  "winningOptionId": "opt_1",
  "tieBreak": "earliest_vote",
  "closedAt": "2026-06-20T19:00:01Z"
}
```

### 3.5 `getRecommendations`
**GET** `/api/events/:eventId/recommendations?city=Milano&q=sushi`

Response:
```json
{
  "recommendations": [
    {"label": "Sushi Zen", "source": "suggested"},
    {"label": "Mikado", "source": "suggested"}
  ]
}
```

---

## 4) Regole sicurezza base (MVP)

### Ruoli e permessi
- **Host**: crea evento, aggiunge/rimuove opzioni, chiude decisione.
- **Guest**: join via link, vota, vede risultati.
- **Enforcement**: RLS su Supabase + verifica ruolo in funzioni server.

### Link token invito
- Token random 128-bit (base64url), salvato solo hash DB (`invite_token_hash`).
- Token con TTL implicito: evento accessibile solo se `status=open` e `close_at` non superato.
- Rotazione token (opzionale MVP+): host può rigenerarlo in caso leak.

### Anti-abuso minimo
- Rate limit per IP + eventId su `joinByLink` e `submitVote` (es. 30 req/5 min).
- Debounce vote write lato client + upsert server (`unique event+participant+option`).
- Fingerprint leggero (`user-agent` + IP hash) per segnalare join sospetti.
- Sanitizzazione input (title, guestName) + lunghezze massime.

---

## 5) Piano rollout tecnico in 2 sprint

## Sprint 1 (settimana 1): “Core decision loop”
**Obiettivo:** chiudere end-to-end il ciclo create → join → vote → close.

- Setup progetto Next.js + Supabase + PostHog SDK.
- Tabelle DB + RLS + migrazioni.
- Implementazione azioni: `createEvent`, `joinByLink`, `submitVote`, `closeDecision`.
- UI minima:
  - Create Event form.
  - Vote Room mobile-first (lista opzioni + voto rapido).
  - Result screen con winner.
- Job chiusura automatica su `close_at`.
- Eventi analytics base:
  - `event_created`, `invite_opened`, `vote_submitted`, `decision_closed`.

**Deliverable:** 1 flusso completo usabile in produzione ristretta.

## Sprint 2 (settimana 2): “Quality + recommendations”
**Obiettivo:** migliorare velocità percepita e adozione.

- `getRecommendations` con provider venue base (o fallback statico per città).
- Realtime tally voti nella room.
- Migliorie anti-abuso e osservabilità (error logging + dashboard KPI).
- Ottimizzazione UX per ridurre friction:
  - join senza login obbligatorio;
  - stato chiusura chiaro e countdown.
- QA smoke + hardening su edge cases (tie, late vote, token invalido).

**Deliverable:** MVP pronto a beta pubblica con metrica Decision Time monitorata.

---

## Rischi tecnici + mitigazioni

1. **Rischio:** conflitti in chiusura evento (manuale vs automatica).  
   **Mitigazione:** transazione atomica DB + lock su riga evento (`status=open` -> `closed` una sola volta).

2. **Rischio:** spam voto/join da link condiviso pubblicamente.  
   **Mitigazione:** rate limit IP/evento, fingerprint soft, possibilità host di rigenerare token.

3. **Rischio:** dipendenza API venue esterna (latenza/failure).  
   **Mitigazione:** timeout breve (1.5s), fallback suggerimenti locali, caching 5-15 min.

4. **Rischio:** bassa adozione per attrito login.  
   **Mitigazione:** guest join immediato, login richiesto solo a host.

5. **Rischio:** Decision Time non migliora nonostante feature complete.  
   **Mitigazione:** KPI dashboard con segmentazione (team size, n opzioni, tempo medio per step) e iterazione UX rapida.

