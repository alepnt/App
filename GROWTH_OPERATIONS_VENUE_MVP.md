# MVP Venue Suggestions — PM Growth + Operations (Locale)

## Obiettivo operativo (MVP)
Dare all’utente **3 venue coerenti** con input minimo (**budget, zona, mood**) in modo rapido e affidabile, privilegiando velocità di esecuzione e qualità percepita.

---

## 1) Schema dataset venue minimo (CSV)

### Colonne indispensabili
1. `venue_id` — identificativo univoco.
2. `name` — nome locale.
3. `city` — città (MVP: una città).
4. `zone` — macro-zona (es. Centro, Navigli, Isola).
5. `address` — indirizzo testuale.
6. `lat` — latitudine (per distanza semplice).
7. `lng` — longitudine.
8. `price_tier` — fascia prezzo: `low | mid | high`.
9. `avg_ticket_eur` — scontrino medio indicativo.
10. `mood_tags` — tag pipe-separated (`casual|romantic|party|quiet|business`).
11. `venue_type` — categoria: `bar | ristorante | cocktail_bar | pizzeria | rooftop`.
12. `capacity_group_min` — gruppo minimo consigliato.
13. `capacity_group_max` — gruppo massimo consigliato.
14. `open_days` — giorni apertura (`Mon,Tue,...`).
15. `open_time` — ora apertura (HH:MM).
16. `close_time` — ora chiusura (HH:MM).
17. `reservation_required` — `yes | no`.
18. `booking_channel` — `phone | dm | form | app | walk-in`.
19. `rating_internal` — rating interno qualità dati/esperienza (1-5).
20. `last_verified_at` — data ultima verifica (ISO date).
21. `active` — `1/0` per includere/escludere dai suggerimenti.

### Template CSV (colonne + esempi)
```csv
venue_id,name,city,zone,address,lat,lng,price_tier,avg_ticket_eur,mood_tags,venue_type,capacity_group_min,capacity_group_max,open_days,open_time,close_time,reservation_required,booking_channel,rating_internal,last_verified_at,active
MIL001,Officina 12,Milano,Navigli,Alzaia Naviglio Pavese 12,45.4512,9.1731,mid,28,"casual|party|friends",cocktail_bar,2,10,"Mon,Tue,Wed,Thu,Fri,Sat,Sun",18:00,02:00,yes,phone,4.4,2026-02-10,1
MIL002,Trattoria Verde,Milano,Porta Romana,Via Muratori 8,45.4528,9.2103,low,22,"casual|quiet|family",ristorante,2,14,"Tue,Wed,Thu,Fri,Sat,Sun",12:00,23:00,no,walk-in,4.1,2026-02-08,1
MIL003,Skyline Terrace,Milano,Centro,Piazza Diaz 4,45.4642,9.1900,high,45,"romantic|business|premium",rooftop,2,8,"Mon,Tue,Wed,Thu,Fri,Sat",19:00,01:00,yes,form,4.6,2026-02-09,1
```

---

## 2) Regole di matching (preferenze gruppo → venue)

## Input utente minimo
- `budget`: low / mid / high
- `zona`: quartiere o macro-zona
- `mood`: uno o più mood (es. casual, romantic)

## Filtri hard (obbligatori)
Applicare in sequenza:
1. `active = 1`
2. compatibilità budget:
   - preferito: `price_tier == budget`
   - tolleranza MVP: ±1 fascia se non ci sono risultati sufficienti
3. zona:
   - prima passata: match esatto su `zone`
   - seconda passata: zone adiacenti (mappa statica)
4. mood:
   - almeno 1 tag in `mood_tags` presente tra i mood utente

## Filtri soft (bonus/malus)
- `rating_internal` alto → bonus
- `last_verified_at` recente (<= 30 giorni) → bonus
- `reservation_required = yes` e richiesta “last minute” → malus
- capienza non allineata alla dimensione gruppo → malus forte

---

## 3) Ranking semplice (priorità, punteggio, fallback)

## Priorità business MVP
1. Coerenza preferenze (budget/zona/mood)
2. Affidabilità operativa (dato verificato + canale prenotazione chiaro)
3. Qualità percepita (rating interno)

## Formula punteggio (0-100)
`score = budget(30) + zona(25) + mood(25) + qualità(10) + freschezza_dato(10)`

Dettaglio:
- **budget (0-30)**
  - match esatto fascia = 30
  - fascia adiacente = 15
  - fuori range = 0
- **zona (0-25)**
  - stessa zona = 25
  - zona adiacente = 12
  - altra zona = 0
- **mood (0-25)**
  - 2+ mood in match = 25
  - 1 mood in match = 15
  - no match = 0
- **qualità (0-10)**
  - `rating_internal` normalizzato su 10
- **freschezza_dato (0-10)**
  - verifica <= 14 giorni: 10
  - 15-30 giorni: 6
  - >30 giorni: 2

## Regole di ordinamento
1. Ordinare per `score` desc
2. Tie-breaker:
   - `rating_internal` più alto
   - `last_verified_at` più recente
   - varietà di `venue_type` (evitare 3 opzioni identiche)

## Fallback (per garantire sempre 3 opzioni)
1. allarga budget a fascia adiacente
2. estendi a zone adiacenti
3. rilassa mood da “must match” a “best effort”
4. se ancora <3 risultati: mostra 2 risultati + messaggio trasparente “stiamo ampliando il matching in questa zona”

---

## 4) SOP operativa settimanale (1 città)

## Obiettivo SOP
Tenere un dataset piccolo ma affidabile (es. 80-150 venue attive) con refresh settimanale rapido.

## Ruoli minimi
- **Ops Local** (1 persona part-time): verifica dati e aggiornamento CSV
- **PM Growth**: monitora KPI e aggiorna regole

## Cadenza (settimanale)

### Lunedì — Data health check (60-90 min)
1. estrai venue con `last_verified_at > 21 giorni`
2. estrai venue con performance bassa (CTR sotto soglia)
3. crea lista priorità verifica (Top 20)

### Martedì/Mercoledì — Verifica operativa (2-3 h)
Per ogni venue prioritaria:
1. verifica apertura/orari/canale prenotazione (sito, maps, chiamata rapida)
2. aggiorna `avg_ticket_eur`, `price_tier`, `mood_tags` se necessario
3. aggiorna `last_verified_at`
4. se venue chiusa/non affidabile → `active = 0`

### Giovedì — Espansione controllata (1-2 h)
1. aggiungi 5-10 nuove venue in zone con copertura bassa
2. garantisci copertura minima per combinazioni frequenti (budget x mood)

### Venerdì — QA + release dataset (45 min)
1. validazione CSV (duplicati, campi vuoti, formato orari)
2. smoke test matching con 10 query tipiche
3. pubblica versione dataset (`venues_YYYYMMDD.csv`)

## Checklist qualità dati (must)
- nessun `venue_id` duplicato
- `active` valorizzato sempre
- coordinate compilate
- almeno 2 mood tag per venue
- `last_verified_at` <= 30 giorni per top venue

---

## 5) Piano evoluzione verso integrazione API futura

## Fase 0 (ora, manuale assistito)
- CSV curato manualmente
- ranking rule-based statico
- tracking KPI base

## Fase 1 (semi-automazione)
- ingest da Google Places / provider similare solo per campi anagrafici
- mantenere override manuale per `mood_tags`, `price_tier`, `active`
- job settimanale di data freshness (flag record da verificare)

## Fase 2 (API ibrida + controllo qualità)
- sync incrementale API (orari, chiusure temporanee, rating esterno)
- motore deduplica (nome + indirizzo + coordinate)
- confidence score per decidere update automatico vs revisione umana

## Fase 3 (ottimizzazione raccomandazioni)
- learning-to-rank leggero con segnali reali (CTR, acceptance, satisfaction)
- personalizzazione soft per cluster utente
- policy di esplorazione: 2 risultati “safe” + 1 risultato “explore”

Nota: evitare complessità marketplace (inventory real-time, aste, pricing dinamico) finché non c’è product-market fit locale.

---

## KPI qualità suggerimenti (MVP)

## KPI core
1. **CTR suggerimenti**
   - definizione: click su almeno una delle 3 venue / sessioni con suggerimenti
   - target MVP iniziale: >35%

2. **Acceptance proposta**
   - definizione: utente conferma una delle venue suggerite
   - target MVP iniziale: >20%

3. **Soddisfazione post-scelta**
   - definizione: voto rapido 1-5 dopo esperienza
   - target MVP iniziale: media >=4.0

## KPI di guardrail operativo
4. **Coverage query**: % richieste con almeno 3 opzioni valide (target >90%)
5. **Freshness**: % venue attive verificate negli ultimi 30 giorni (target >80%)
6. **Mismatch rate**: % feedback “non in linea con mood/budget/zona” (target <15%)

## Dashboard minima (settimanale)
- funnel: query → click → acceptance → rating
- breakdown per zona, budget, mood
- top 10 venue performanti e bottom 10 da rivedere
