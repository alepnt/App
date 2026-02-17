# Spec tecnica + UX — Invito tramite link unico (MVP security-minded)

## 0) Obiettivo e principi

**Obiettivo di prodotto:** massimizzare partecipazione e voto rapido da ospiti invitati con link unico, senza login obbligatorio upfront.

**Principi guida (MVP):**
1. **Zero frizione all’ingresso**: tap sul link → accesso evento quasi immediato.
2. **Sicurezza sufficiente**: mitigare abuso più probabile (spam, replay, leak, multi-join artificiale) senza flussi complessi.
3. **Progressive trust**: richiedere verifiche aggiuntive solo quando serve (step-up), non all’inizio.
4. **Osservabilità by default**: funnel e segnali rischio tracciati dall’inizio.

---

## 1) Flusso completo invito/join da link

## 1.1 Creazione invito (host/backend)

1. Host crea invito per evento `event_id`.
2. Backend genera token firmato con metadati minimi:
   - `event_id`
   - `invite_id` univoco
   - `role=guest`
   - `scope=join+vote`
   - `iat`, `exp`
   - eventuale `max_joins` (default 1 device attivo)
3. Backend salva record server-side `invite_id` con stato (`active`, `consumed`, `revoked`, `expired`) e contatori.
4. Viene prodotto link short/long, es:
   - short: `https://p.app/i/AbC9x`
   - resolved: `https://p.app/join?it=<invite_token>`

## 1.2 Apertura link (guest)

1. Guest apre link.
2. API `POST /invites/resolve` valida token e stato invito.
3. Se valido, backend crea/aggiorna **guest session** (cookie HTTP-only + refresh breve) e restituisce payload evento minimale.
4. UI mostra landing evento + CTA primaria: **“Entra e vota”**.

## 1.3 Join evento

1. Guest preme CTA oppure auto-join se policy “1 tap”.
2. API `POST /events/{id}/join`:
   - associa sessione guest all’evento
   - registra `participant_id` pseudonimo
   - marca `invite_id` come `consumed` (soft: consumato ma riusabile dallo stesso device/sessione)
3. UI conferma ingresso e mostra immediatamente area voto.

## 1.4 Voto rapido

1. Guest seleziona opzione e invia.
2. API `POST /events/{id}/votes` con idempotency key lato client.
3. Backend verifica:
   - sessione valida
   - membership evento valida
   - policy anti-duplica (1 voto per `participant_id` o per round)
4. UI mostra conferma e stato voto.

## 1.5 Rientro e deep-link repeat

- Se utente riapre link su stesso device/sessione: accesso diretto evento (nessun attrito).
- Se riapre su nuovo device:
  - default MVP: consenti join ma applica limiti e risk checks (vedi §3)
  - se rischio alto: step-up leggero (captcha/email OTP opzionale solo in eccezioni)

---

## 2) Formato token/link e regole di validità

## 2.1 Scelta consigliata per MVP

**Token opaco random + stato server-side** (preferito rispetto a JWT self-contained puro per revoca/controllo abuso).

- `invite_token`: 128 bit random (base62/base64url), non predicibile.
- DB mapping:
  - `invite_token_hash` (mai token in chiaro a riposo)
  - `invite_id`, `event_id`, `exp`, `status`, `created_by`, `max_joins`, `consumed_count`, `risk_flags`.

**Perché non solo JWT?**
- JWT puro è veloce ma meno efficace per revoca immediata, single-use robusto e leak containment.
- Per MVP growth + controllo abuso, il lookup server-side è compromesso migliore.

## 2.2 Struttura link

- Link condiviso: `https://p.app/i/{code}`
- `{code}` = token opaco corto (>= 20 chars base62) o short-id che risolve a token reale server-side.

**Best practice URL:**
- No PII nel link.
- No `event_name` sensibile in query.
- `Referrer-Policy: strict-origin-when-cross-origin` su pagine join.

## 2.3 Validità token (regole)

1. **TTL default:** 72h prima dell’evento o fino a fine evento (scegliere il minore tra policy e `event_end + grace`).
2. **Soft single-consume:** primo join “lega” invito a fingerprint leggero + sessione; riuso sullo stesso contesto permesso.
3. **Hard cap multi-device:** `max_distinct_devices=2` per evitare blocchi utenti legittimi (telefono + desktop).
4. **Revoca immediata:** host/admin può revocare invito; token invalido in tempo reale.
5. **Rotation opzionale:** host può rigenerare link, invalidando precedente.

---

## 3) Controlli minimi anti-abuso (MVP)

## 3.1 Spam/bruteforce token

- Token ad alta entropia (>=128 bit).
- Rate limit su `resolve` per IP/subnet/device cookie:
  - es. 30 req/5 min/IP + 10 req/min/device key.
- Progressive backoff + 429.
- WAF rules base per pattern anomali.

## 3.2 Join multipli artificiali

- Device binding leggero (cookie + user-agent hash + IP class C soft signal).
- Limite `distinct_devices` per invite.
- Participant dedupe per evento: stesso device/sessione non crea partecipanti multipli.
- Idempotency su endpoint join/vote.

## 3.3 Link leak / forward incontrollato

- Link sempre revocabile.
- Alert host se invite mostra comportamento anomalo (N join da geografie/IP molto diverse in poco tempo).
- Modalità “evento privato strict” (feature flag): dopo soglia rischio, richiede step-up (captcha o OTP leggero).

## 3.4 Vote integrity minima

- Un voto attivo per `participant_id` per round (o ultimo voto prevale, ma auditato).
- Audit log append-only: invite_resolved, join_success, vote_cast, risk_block.
- Timestamp server authoritative.

---

## 4) UX ospite first-time (zero frizione)

## 4.1 UX target (3 tap massimo)

1. Apertura link.
2. Schermata evento con contesto minimo (titolo, host, privacy note).
3. CTA primaria unica: **“Entra e vota”**.
4. Subito scheda voto.

## 4.2 Microcopy consigliata

- Titolo: “Sei invitato a partecipare”.
- Sottotitolo fiducia: “Nessuna registrazione richiesta. Accesso rapido in 1 tap.”
- Privacy breve: “Usiamo solo dati tecnici minimi per prevenire abusi.”

## 4.3 Error UX (senza drop-off)

- Link scaduto: CTA “Richiedi nuovo link” + fallback contatto host.
- Link revocato: messaggio chiaro + “Contatta organizzatore”.
- Rischio alto/blocco temporaneo: “Verifica rapida per continuare” (captcha inline, non pagina separata).

## 4.4 Progressive profiling (opzionale)

- Nome display opzionale dopo il primo voto, mai prima del join.
- Notifiche/opt-in post-voto, non in pre-join.

---

## 5) Analytics funnel invito → join → voto

## 5.1 Eventi da tracciare

1. `invite_link_opened`
2. `invite_resolve_success` / `invite_resolve_fail_reason`
3. `join_cta_viewed`
4. `join_submitted`
5. `join_success` / `join_blocked_risk`
6. `ballot_viewed`
7. `vote_submitted`
8. `vote_success` / `vote_rejected_reason`
9. `rejoin_success`

## 5.2 KPI principali

- Open→Resolve rate
- Resolve→Join rate
- Join→Vote completion rate
- Median time-to-vote (click link → voto confermato)
- Block rate per controllo rischio
- False-positive proxy: `% utenti bloccati che completano dopo step-up`

## 5.3 Segmentazione minima

- Device type (mobile/desktop)
- Source (WhatsApp, SMS, email, copy link)
- Nuovo vs returning session
- Risk tier (low/medium/high)

## 5.4 Dashboard operativa

- Funnel realtime per evento
- Alert su calo conversione dopo introduzione controllo sicurezza
- Heatmap error reasons (expired/revoked/rate-limited/risk-block)

---

## 6) Matrice rischi sicurezza vs frizione utente

| Controllo | Rischio mitigato | Impatto frizione | Impatto conversione | Decisione MVP |
|---|---|---:|---:|---|
| Token opaco 128-bit + DB state | Guessing, replay incontrollato | Basso | Neutro/positivo | **Adottare** |
| TTL invito (72h o fine evento) | Leak persistente | Basso | Basso | **Adottare** |
| Soft single-consume + 2 device cap | Multi-join abuso | Medio-basso | Medio (edge case) | **Adottare** |
| Rate limiting resolve/join | Bot/spam | Basso | Basso | **Adottare** |
| CAPTCHA always-on | Bot | Alto | Alto negativo | **Non adottare** |
| CAPTCHA step-up risk-based | Bot mirato | Medio solo su subset | Basso globale | **Adottare condizionale** |
| OTP obbligatoria upfront | Link forwarding | Alto | Alto negativo | **Non adottare MVP** |
| Revoca/rotazione link host | Leak operativo | Basso | Neutro | **Adottare** |
| Audit log completo | Incident response/frode | Nessuno utente | Neutro | **Adottare** |

---

## 7) Decisioni consigliate con trade-off espliciti

1. **No login upfront** (decisione core conversione).
   - Pro: massima velocità di ingresso.
   - Contro: identità debole iniziale.
   - Mitigazione: binding sessione + limiti device + step-up risk-based.

2. **Token opaco server-side invece di JWT puro**.
   - Pro: revoca immediata, controllo single-use reale, audit migliore.
   - Contro: lookup DB aggiuntivo.
   - Scelta: migliore equilibrio per MVP security-minded.

3. **Controlli risk-based, non universali**.
   - Pro: preserva conversione della maggioranza buona.
   - Contro: complessità logica rischio.
   - Scelta: implementare regole semplici (rate/IP/device anomaly) prima di ML.

4. **Soft single-use con tolleranza multi-device limitata**.
   - Pro: riduce abuso senza rompere casi legittimi.
   - Contro: qualche abuso residuale possibile.
   - Scelta: accettabile MVP, monitorare con analytics e iterare.

5. **Telemetry completa fin dal day-1**.
   - Pro: decisioni data-driven su sicurezza vs frizione.
   - Contro: effort iniziale tracking.
   - Scelta: indispensabile per ottimizzare funnel senza regressioni nascoste.

---

## 8) API MVP suggerite (contratto minimo)

- `POST /invites/resolve` → valida link, ritorna `event_preview`, `risk_tier`, `session`.
- `POST /events/{event_id}/join` → crea/riusa participant, ritorna stato join.
- `POST /events/{event_id}/votes` → registra voto con idempotency key.
- `POST /invites/{invite_id}/revoke` (host)
- `POST /invites/{invite_id}/rotate` (host)

Error codes coerenti (`INVITE_EXPIRED`, `INVITE_REVOKED`, `RISK_STEPUP_REQUIRED`, `RATE_LIMITED`) per UX chiara e analytics pulita.

## 9) Rollout consigliato

- **Fase 1 (baseline):** token opaco, TTL, rate-limit, join/vote idempotent, funnel analytics.
- **Fase 2:** risk scoring semplice + captcha step-up solo high risk.
- **Fase 3:** policy adattiva per tipologia evento (pubblico vs privato strict).

Con questa impostazione ottieni “sicurezza sufficiente per MVP” mantenendo un’esperienza ospite molto rapida e ottimizzata alla conversione.
