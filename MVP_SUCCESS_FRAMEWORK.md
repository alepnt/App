# PlanIt — MVP Success Framework

## 1) North Star formalizzata

### North Star Metric (NSM)

**Decision Time (DT)** = tempo, in minuti, tra `event_created_at` e `decision_finalized_at` per ogni evento.

\[
DT_i = decision\_finalized\_at_i - event\_created\_at_i
\]

**Perimetro NSM MVP**
- Solo eventi di gruppi **4–8 partecipanti invitati**.
- Solo eventi sociali con outcome esplicito (slot+budget+mood o equivalente).
- Esclude eventi annullati manualmente prima di ricevere almeno 1 voto.

**Obiettivo MVP (vincolante)**
- **Mediana Decision Time < 60 minuti** su cohort settimanale di gruppi 4–8.

### Definizioni operative

| Termine | Definizione operativa | Note anti-ambiguità |
|---|---|---|
| Decisione finale | Evento nello stato `closed` con opzione vincente determinata (auto o host fallback) | Non conta “chat conclusa” senza stato chiuso |
| Evento valido per NSM | Evento con almeno 2 voti o 1 voto + scadenza raggiunta | Evita falsi positivi da eventi “vuoti” |
| Deadline | Tempo max configurato alla creazione (default 120 min nel test MVP) | Parametro tracciato per analisi |
| Tempo di chiusura | Minuti dal create alla chiusura | Base per benchmark vs WhatsApp |

---

## 2) KPI primari e secondari

### KPI primari (go/no-go)

| KPI | Formula | Perché impatta Decision Time | Soglia go/no-go MVP |
|---|---|---|---|
| **P1. Median Decision Time** | mediana(DT) | È la North Star | **GO se < 60 min**; NO-GO se ≥ 60 |
| **P2. % Eventi chiusi entro 60 min** | eventi chiusi ≤60 min / eventi validi | Misura consistenza della promessa 60s→60m | **GO se ≥ 55%**; NO-GO se < 45% |
| **P3. Decision Closure Rate** | eventi chiusi / eventi creati | Senza chiusura non esiste riduzione tempi | **GO se ≥ 70%**; NO-GO se < 60% |
| **P4. Voter Participation Rate** | invitati che votano / invitati totali | Più voti in fretta = meno stallo | **GO se ≥ 65%**; NO-GO se < 50% |

### KPI secondari (diagnostici, non vanity)

| KPI | Formula | Uso decisionale |
|---|---|---|
| S1. Time to First Vote (TTFV) | mediana(primo voto - creazione evento) | Identifica attrito iniziale |
| S2. Voting Completion Time | mediana(ultimo voto utile - primo voto) | Misura convergenza del gruppo |
| S3. Auto-close Success Rate | eventi chiusi da regola automatica / eventi chiusi | Valuta qualità motore decisionale |
| S4. Reminder Lift | Δ closure rate tra eventi con reminder vs senza | Quantifica impatto reminder |
| S5. Host Override Rate | chiusure con intervento host / eventi chiusi | Alto valore = algoritmo non risolve bene |
| S6. Reopen Rate (entro 24h) | eventi riaperti / eventi chiusi | Proxy di qualità decisione finale |

---

## 3) Soglie minime di validazione (go/no-go)

### Regola di decisione MVP (fine ciclo test)

**GO** se per **2 settimane consecutive**:
1. `Median Decision Time < 60 min`
2. `Decision Closure Rate ≥ 70%`
3. `Voter Participation Rate ≥ 65%`
4. `Reopen Rate ≤ 8%`

**NO-GO / Pivot del flusso** se in qualunque settimana:
- `Median Decision Time ≥ 90 min` **oppure**
- `Decision Closure Rate < 55%` **oppure**
- `Time to First Vote > 20 min` (mediana)

### Guardrail qualitativi (a supporto)

| Guardrail | Soglia critica | Azione se violata |
|---|---|---|
| Crash/sessione in funnel decisione | > 3% sessioni | Blocco nuove feature, fix stabilità |
| Errori invito/link | > 2% click invito | Priorità a linking e onboarding ospite |
| Eventi “vuoti” (0 voti) | > 20% eventi creati | Ridisegno CTA voto + reminder |

---

## 4) Leading indicators — prima settimana di test

> Obiettivo: capire in 7 giorni se il funnel può realisticamente convergere verso NSM target.

| Leading indicator | Target giorno 3 | Target giorno 7 | Segnale di rischio |
|---|---:|---:|---|
| LI1. % eventi con primo voto entro 10 min | ≥ 45% | ≥ 55% | < 35% al giorno 7 |
| LI2. Median TTFV | ≤ 12 min | ≤ 10 min | > 18 min al giorno 7 |
| LI3. % eventi con ≥50% invitati votanti entro 30 min | ≥ 35% | ≥ 45% | < 25% al giorno 7 |
| LI4. Closure Rate cumulata | ≥ 55% | ≥ 65% | < 50% al giorno 7 |
| LI5. % chiusure entro 60 min | ≥ 40% | ≥ 50% | < 35% al giorno 7 |

**Interpretazione rapida**
- Se LI1+LI2 sono sotto target: problema di activation/urgency.
- Se LI1 ok ma LI4/LI5 no: problema di convergenza regole decisionali.
- Se LI4 ok ma reopen alto: problema di qualità dell’outcome.

---

## 5) Decision Efficiency Score (metrica composita)

### Obiettivo
Avere un indicatore unico (0–100) utile per confrontare release/coorti, mantenendo il focus su riduzione del Decision Time.

### Formula proposta

\[
DES = 100 \times (0.45 \cdot T + 0.25 \cdot C + 0.20 \cdot P + 0.10 \cdot Q)
\]

Dove:
- **T (Time Score)** = \(\max(0, \min(1, 60/MedianDT))\)
- **C (Closure Score)** = \(\min(1, ClosureRate/0.70)\)
- **P (Participation Score)** = \(\min(1, ParticipationRate/0.65)\)
- **Q (Quality Score)** = \(\max(0, 1 - ReopenRate/0.08)\)

### Perché questi pesi
- **45% su Time**: allineamento diretto alla North Star.
- **25% su Closure**: evitare “veloce ma incompleto”.
- **20% su Participation**: senza voto non c’è decisione robusta.
- **10% su Quality**: evita decisioni fragili che si riaprono.

### Soglie operative DES

| Fascia DES | Interpretazione | Decisione |
|---|---|---|
| ≥ 80 | MVP molto solido | Scalare acquisizione gruppi pilota |
| 65–79 | Buona trazione, attriti residuali | Iterazioni mirate sul funnel |
| 50–64 | Segnale debole | Sprint correttivo focalizzato |
| < 50 | Tesi non validata | Rivalutare proposta/UX core |

---

## 6) Piano minimo di raccolta dati

## Event taxonomy (essenziale)

| Evento | Quando scatta | Proprietà obbligatorie |
|---|---|---|
| `event_created` | Host crea evento | `event_id`, `group_id`, `host_id`, `invited_count`, `deadline_minutes`, `slots_count`, `budget_options_count`, `mood_options_count`, `created_at` |
| `invite_opened` | Invitato apre link | `event_id`, `user_id/guest_id`, `source_channel`, `opened_at`, `device_type` |
| `vote_submitted` | Utente invia voto | `event_id`, `voter_id`, `slot_choice`, `budget_choice`, `mood_choice`, `vote_latency_sec`, `submitted_at` |
| `reminder_sent` | Sistema invia reminder | `event_id`, `reminder_type`, `minutes_to_deadline`, `sent_at` |
| `decision_closed` | Evento viene chiuso | `event_id`, `closure_mode` (auto/host), `decision_time_min`, `votes_count`, `participants_voted_pct`, `closed_at` |
| `decision_reopened` | Evento riaperto dopo chiusura | `event_id`, `reopen_reason`, `minutes_since_close`, `reopened_at` |
| `event_abandoned` | Deadline passata senza decisione | `event_id`, `votes_count`, `time_since_create_min`, `abandoned_at` |

### Proprietà trasversali standard
- `app_version`
- `platform` (iOS/Android/WebView)
- `experiment_id` (se A/B)
- `group_size_bucket` (4–5, 6–8, 9+)

### Frequenza analisi (minima ma sufficiente)

| Frequenza | Report | Owner | Output atteso |
|---|---|---|---|
| Giornaliera (D1–D14) | Dashboard leading indicators + anomalie | PM + data | Alert rapidi su colli di bottiglia |
| Bisettimanale | Funnel diagnostico per step | PM + design + eng | Backlog priorità sprint |
| Settimanale | Scorecard KPI primari + DES | Leadership | Decisione go/iterate/no-go |

---

## 7) Come decidiamo di iterare (trigger numerici)

### Framework decisionale

| Trigger numerico | Diagnosi probabile | Azione di iterazione (entro 1 sprint) |
|---|---|---|
| `Median TTFV > 15 min` per 3 giorni | Invito o CTA voto debole | Semplificare entry vote a 1 tap + reminder a 10 min |
| `% eventi chiusi entro 60 min < 45%` settimanale | Regole di convergenza inefficaci | Ridurre opzioni iniziali (max 2 slot), tie-break più aggressivo |
| `Participation Rate < 55%` settimanale | Frizione onboarding ospite | Accesso guest senza friction + deep link diretto al voto |
| `Host Override Rate > 30%` | Algoritmo non rappresenta preferenze | Ritoccare scoring pesi slot/budget/mood |
| `Reopen Rate > 10%` | Qualità decisione bassa | Inserire conferma finale con “ultimo consenso” rapido |
| `Closure Rate < 60%` con TTFV buono | Stallo nel mid-funnel | Deadline più corta di default + nudges progressivi |

### Prioritizzazione delle iterazioni
Ogni sprint prende solo le iniziative che mostrano:
1. **Impatto stimato su Decision Time ≥ 15%**, e
2. **Tempo implementazione ≤ 1 sprint**, e
3. **Rischio tecnico basso/medio**.

Se una proposta non migliora direttamente `DT`, `Closure` o `Participation`, non entra nel ciclo MVP.

---

## 8) Template scorecard settimanale (pronto Notion)

| Metrica | Week N | Week N-1 | Delta | Target | Stato |
|---|---:|---:|---:|---:|---|
| Median Decision Time (min) |  |  |  | < 60 |  |
| % Eventi chiusi entro 60 min |  |  |  | ≥ 55% |  |
| Decision Closure Rate |  |  |  | ≥ 70% |  |
| Participation Rate |  |  |  | ≥ 65% |  |
| Median TTFV (min) |  |  |  | ≤ 10 |  |
| Reopen Rate |  |  |  | ≤ 8% |  |
| Decision Efficiency Score (0–100) |  |  |  | ≥ 65 |  |

**Regola finale:** l’MVP è validato solo se riduce in modo affidabile il tempo decisionale reale, non se aumenta semplicemente attività o traffico.
