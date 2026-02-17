# PlanIt — Product Risk Matrix MVP (Pragmatic)

## Obiettivo
Ridurre il rischio operativo dell’MVP restando nel perimetro: decisione di gruppo più rapida di WhatsApp, senza introdurre feature fuori scope.

Scala usata:
- **Probabilità (P)**: 1 bassa, 5 alta
- **Impatto (I)**: 1 basso, 5 critico
- **Risk score**: `P x I`

---

## 1) Matrice rischi completa (probabilità x impatto)

| # | Rischio prioritario | P | I | Score | Livello | Segnale precoce (entro 72h) |
|---|---|---:|---:|---:|---|---|
| R1 | **Nessuno vota** | 4 | 5 | **20** | Critico | `TTFV` mediana > 15 min e `% eventi con 0 voti` > 25% |
| R2 | **Pareggi frequenti** | 4 | 4 | **16** | Alto | `% eventi in tie` > 30% e `Host override` > 25% |
| R3 | **UX troppo lunga** | 3 | 5 | **15** | Alto | `tempo medio completamento voto` > 75s e drop tra step voto > 20% |
| R4 | **Nessun valore percepito vs WhatsApp** | 3 | 5 | **15** | Alto | `% utenti che riusano entro 7 giorni` < 25% e feedback “faccio prima in chat” > 30% |

**Ordine di priorità operativo:** R1 → R2 → R3 → R4 (in base a score e impatto diretto su Decision Time).

---

## 2) Piano per rischio: trigger, mitigazioni preventive, fallback operativo

## R1 — Nessuno vota

**Trigger precoce**
- `Time to First Vote (TTFV)` mediana > 15 min (3 giorni consecutivi).
- `% eventi con almeno 1 voto entro 10 min` < 45%.

**Mitigazioni preventive (implementabili subito)**
1. **Link invito deep-link diretto al voto** (niente schermate intermedie).
2. **Default 1-tap**: preset rapido per slot/budget/mood con conferma in un tap.
3. **Reminder automatico a +10 min** solo a non-votanti.

**Fallback operativo**
- Se dopo 24h non migliora: attivare **host ping guidato** con testo pronto (“manca il tuo voto, 10 secondi”).
- Se evento resta senza voti a deadline -15 min: suggerire **chiusura host con opzione best guess**.

**Esperimenti rapidi (validazione mitigazioni)**
- **A/B #1**: deep-link diretto vs flow attuale.
  - KPI successo: `TTFV` -20% e `% primo voto entro 10 min` +10pp.
  - Durata: 5 giorni o 80 eventi.
- **A/B #2**: reminder a +10 min vs nessun reminder.
  - KPI successo: `% eventi con almeno 1 voto` +12pp.

---

## R2 — Pareggi frequenti

**Trigger precoce**
- `% eventi con pareggio su opzione top` > 30%.
- `% chiusure manuali host` > 25%.

**Mitigazioni preventive**
1. **Ridurre opzioni iniziali**: max 2 slot principali (non 3+).
2. **Tie-break deterministico semplice**: priorità a opzione con più disponibilità temporale; in seconda battuta timestamp del primo voto.
3. **Deadline chiara e breve default** (es. 90 min) per evitare parità da inattività.

**Fallback operativo**
- Se tie persiste oltre deadline: **auto-selezione migliore opzione** con messaggio trasparente “pareggio risolto automaticamente”.
- Host può override, ma solo con CTA secondaria (non default).

**Esperimenti rapidi**
- **A/B #1**: 2 opzioni vs 3 opzioni iniziali.
  - KPI successo: `% tie` -30% relativo; `Decision Time` -15%.
- **A/B #2**: tie-break auto on vs off.
  - KPI successo: `% chiusura auto` +15pp senza aumento `Reopen rate` > +2pp.

---

## R3 — UX troppo lunga

**Trigger precoce**
- `tempo completamento voto` mediano > 75 secondi.
- Drop-off tra apertura e submit voto > 20%.

**Mitigazioni preventive**
1. **Unica schermata voto** (slot, budget, mood in sequenza compatta).
2. **Ridurre copy e micro-step**: massimo 3 azioni visibili.
3. **Progress indicator minimale** (“1 schermata, 10 secondi”).

**Fallback operativo**
- Se drop resta alto: passare a **modalità voto rapido** con solo slot + 1 preferenza opzionale.
- Se necessario, rendere budget/mood opzionali in MVP (senza eliminare flusso base).

**Esperimenti rapidi**
- **Usability sprint 48h** su 8–10 utenti target (task “vota in meno di 15s”).
  - KPI successo: mediana task < 20s, completion > 85%.
- **A/B** singola schermata vs multi-step.
  - KPI successo: `submit rate` +10pp, tempo medio voto -25%.

---

## R4 — Nessun valore percepito vs WhatsApp

**Trigger precoce**
- `% eventi chiusi entro 60 min` < 50%.
- `% utenti che creano un 2° evento in 7 giorni` < 25%.
- Survey post-evento: “più veloce di WhatsApp?” con sì < 40%.

**Mitigazioni preventive**
1. **Posizionamento esplicito nel prodotto**: “Decidete in <60 min”.
2. **Outcome immediato condivisibile**: recap finale pronto da inoltrare in chat.
3. **Riduzione attrito host**: template evento precompilato (2 tap).

**Fallback operativo**
- Se valore non percepito dopo 2 settimane: concentrare onboarding su **use case ad alta urgenza** (stesso giorno/serata).
- Ridurre scope comunicato: “strumento per decidere rapidamente”, non “sostituto chat”.

**Esperimenti rapidi**
- **Test messaggio valore** in onboarding: “chiudi in <60 min” vs baseline.
  - KPI successo: `event_created -> decision_closed` +10pp.
- **Recap condivisibile ON/OFF**.
  - KPI successo: `% riuso host entro 7 giorni` +8pp.

---

## 3) Runbook operativo sintetico (“se succede X allora facciamo Y”)

| Se succede X (trigger) | Allora facciamo Y (entro 24h) | Owner | SLA |
|---|---|---|---|
| `TTFV > 15 min` per 3 giorni | Attivare deep-link diretto + reminder +10 min per tutti gli eventi nuovi | PM + Eng | 24h |
| `% eventi 0 voti > 25%` | Abilitare host ping guidato e template messaggio precompilato | PM + Ops | 24h |
| `% tie > 30%` | Ridurre opzioni a 2 + attivare tie-break automatico | PM + Eng | 24h |
| `% host override > 25%` | Rendere tie-break auto default e host override secondario | PM | 48h |
| `tempo voto > 75s` o drop > 20% | Switch a layout “single screen voto rapido” | Design + Eng | 48h |
| `% chiusure < 50% entro 60 min` | Deadline default a 90 min + reminder progressivo a -30/-10 min | PM + Eng | 24h |
| `riuso 7d < 25%` | Enfatizzare value proposition “<60 min” + recap condivisibile | PM + Growth | 72h |

**Regola escalation:** se 2 trigger critici restano rossi per 2 settimane consecutive, bloccare nuove feature e fare sprint solo su funnel voto/chiusura.

---

## 4) Piano monitoraggio settimanale (MVP-safe)

## KPI per rischio (collegamento diretto)

| Rischio | KPI monitorabili | Target settimanale | Soglia allarme |
|---|---|---:|---:|
| R1 Nessuno vota | `TTFV mediana`, `% eventi con primo voto <10 min`, `% eventi 0 voti` | TTFV ≤ 10 min; ≥55%; ≤15% | >15 min; <45%; >25% |
| R2 Pareggi frequenti | `% eventi in tie`, `% host override`, `% auto-close` | ≤20%; ≤15%; ≥60% | >30%; >25%; <45% |
| R3 UX troppo lunga | `tempo mediano voto`, `submit rate voto`, drop funnel voto | ≤45s; ≥80%; ≤15% | >75s; <65%; >20% |
| R4 Valore vs WhatsApp | `% chiusure ≤60 min`, `reuse host 7d`, survey “più veloce di WA” | ≥55%; ≥35%; ≥55% | <50%; <25%; <40% |

## Cadenzamento operativo
- **Lunedì (30 min)**: review dashboard KPI rischio + individuazione trigger rossi.
- **Martedì**: decisione unica su 1 mitigazione per rischio critico (max 2 cambi/settimana).
- **Giovedì**: check intermedio esperimenti (guardrail: no peggioramento closure rate >5pp).
- **Venerdì**: retro rapida + decisione “keep / rollback / iterate”.

## Template decisione settimanale (pronto all’uso)
- **Rischio in stato rosso:** ___
- **Trigger osservato:** ___
- **Mitigazione attivata:** ___
- **Esito esperimento:** vincente / neutro / perdente
- **Decisione settimana prossima:** scalare / correggere / spegnere

---

## Principi guida per restare nel perimetro MVP
1. **Semplice > perfetto**: una sola mitigazione per volta, misurabile in 7 giorni.
2. **Niente feature nuove non essenziali**: solo interventi su invito, voto, reminder, chiusura.
3. **Fail-fast controllato**: se una mitigazione non migliora KPI core in 1 settimana, rollback.
4. **Focus outcome**: ogni azione deve migliorare almeno uno tra `TTFV`, `Closure Rate`, `Decision Time`.
