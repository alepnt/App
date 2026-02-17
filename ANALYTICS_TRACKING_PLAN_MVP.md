# Tracking & Analytics Plan MVP (Founder Team)

## Obiettivo
Costruire un impianto analytics **snello ma azionabile** per migliorare velocità e qualità decisionale, evitando eventi superflui.

---

## 1) Tracking plan completo (eventi + proprietà + naming convention)

### Naming convention
- **Eventi**: `snake_case`, verbo al passato/fatto (`event_created`, `vote_submitted`, `decision_closed`).
- **Proprietà**: `snake_case`, nomi chiari e stabili.
- **ID**: UUID/stringhe consistenti (`event_id`, `group_id`, `user_id`).
- **Timestamp**: UTC ISO-8601 (`event_timestamp`).
- **Versionamento schema**: `schema_version` su ogni evento (es. `1.0`).
- **Regole di qualità**:
  - nessuna proprietà ridondante già derivabile;
  - evitare testo libero quando bastano enum;
  - massimo set minimo di proprietà per evento.

### Proprietà comuni (tutti gli eventi)
| Proprietà | Tipo | Esempio | Obbligatoria | Note |
|---|---|---|---|---|
| `event_name` | string | `vote_submitted` | Sì | Nome evento |
| `event_timestamp` | datetime UTC | `2026-02-17T10:12:00Z` | Sì | Tempo server-side |
| `event_id` | string | `evt_123` | Sì | ID univoco record evento analytics |
| `user_id` | string | `usr_45` | Sì* | Per eventi di sistema usare `system` |
| `group_id` | string | `grp_9` | Sì | Unità di analisi core |
| `session_id` | string | `sess_77` | No | Utile per debug funnel |
| `platform` | enum | `ios`, `android`, `web` | Sì | Segmentazione tecnica |
| `app_version` | string | `1.3.2` | Sì | QA regressioni |
| `schema_version` | string | `1.0` | Sì | Gestione evoluzioni |

### Eventi MVP (minimo utile)
> Si mantengono i 3 eventi richiesti e si aggiunge **solo 1 evento tecnico** per misurare drop-off inviti/voto senza ambiguità.

#### A. `event_created`
Quando viene creato un evento decisionale.

| Proprietà specifica | Tipo | Obbligatoria | Esempio | Perché serve |
|---|---|---|---|---|
| `event_type` | enum | Sì | `dinner`, `trip`, `meeting`, `other` | Segmento comportamento |
| `invited_count` | int | Sì | `6` | Denominatore votazione |
| `deadline_at` | datetime UTC | No | `2026-02-19T20:00:00Z` | Analisi urgenza |
| `creation_channel` | enum | Sì | `manual`, `template`, `duplicate` | Ottimizzazione UX |
| `creator_role` | enum | Sì | `member`, `admin` | Differenze adozione |
| `time_slot_bucket` | enum | Sì | `morning`, `afternoon`, `evening`, `night` | Segmentazione fascia oraria |

#### B. `invite_delivered` (evento tecnico consigliato)
Quando un invitato riceve effettivamente l’invito (in-app/push).

| Proprietà specifica | Tipo | Obbligatoria | Esempio | Perché serve |
|---|---|---|---|---|
| `event_id` | string | Sì | `ev_123` | Join con funnel |
| `invitee_user_id` | string | Sì | `usr_78` | Denominatore reale votanti |
| `delivery_channel` | enum | Sì | `push`, `in_app`, `sms` | Performance canali |
| `delivery_status` | enum | Sì | `delivered`, `failed` | Diagnosi drop-off tecnico |

#### C. `vote_submitted`
Quando un invitato invia il voto.

| Proprietà specifica | Tipo | Obbligatoria | Esempio | Perché serve |
|---|---|---|---|---|
| `event_id` | string | Sì | `ev_123` | Join con creazione/chiusura |
| `vote_option_id` | string | Sì | `opt_3` | Distribuzione preferenze |
| `vote_rank` | int | No | `1` | Se voto ordinato |
| `response_time_sec` | int | Sì | `5400` | Latenza risposta utente |
| `is_vote_changed` | bool | Sì | `false` | Frizione / indecisione |

#### D. `decision_closed`
Quando l’evento viene chiuso con outcome (manuale/automatico/scadenza).

| Proprietà specifica | Tipo | Obbligatoria | Esempio | Perché serve |
|---|---|---|---|---|
| `event_id` | string | Sì | `ev_123` | Join completo |
| `closed_reason` | enum | Sì | `majority_reached`, `deadline_reached`, `manual_close`, `cancelled` | Qualità decisionale |
| `time_to_decision_sec` | int | Sì | `12600` | KPI core |
| `voters_count` | int | Sì | `4` | KPI coinvolgimento |
| `invited_count_snapshot` | int | Sì | `6` | Coerenza metrica chiusura |
| `winning_option_id` | string | No | `opt_3` | Analisi outcome |

### Dizionario KPI (calcolo standard)
| KPI | Formula |
|---|---|
| `time_to_decision` | mediana(`decision_closed.time_to_decision_sec`) |
| `% eventi chiusi` | `decision_closed / event_created` (stesso periodo) |
| `% invitati votanti` | `distinct vote_submitted.user_id / distinct invite_delivered.invitee_user_id` |
| `drop-off funnel` | step conversioni: creato -> invito consegnato -> voto -> chiusura |
| `eventi/gruppo/mese` | `event_created` per `group_id` nel mese |

---

## 2) Dashboard MVP founder team (giornaliera + settimanale)

## Mock testuale — Vista Giornaliera (D-1)
```
[HEADER]
Data: 2026-02-16 | Tot gruppi attivi: 128 | Alert attivi: 2

[ROW KPI CORE]
1) Time to Decision (mediana): 3h 25m   (target < 4h)   [verde]
2) % Eventi chiusi: 71%                 (target > 75%)   [giallo]
3) % Invitati votanti: 54%              (target > 60%)   [rosso]
4) Eventi creati: 214                    (DoD +12%)

[FUNNEL]
Creati 214 -> Inviti consegnati 1.102 utenti -> Votanti 595 -> Eventi chiusi 152
Conversioni: 100% -> 78% -> 54% -> 71%
Drop maggiore: Invito consegnato -> Voto (-24pp)

[TOP SEGMENTI CRITICI]
- Gruppi piccoli (2-4): % votanti 62%
- Gruppi medi (5-8): % votanti 49%  <-- criticità
- Fascia evening: Time to Decision +35% vs media

[AZIONI SUGGERITE]
- Test reminder automatico a +45m per gruppi 5-8
- A/B copy notifica per eventi serali
```

## Mock testuale — Vista Settimanale (WTD)
```
[HEADER]
Settimana 2026-W07 | Gruppi attivi: 603 | WoW eventi: +9%

[TREND KPI (7 giorni)]
- Time to Decision mediana: 3h40m (WoW -18m)
- % Eventi chiusi: 74% (WoW +3pp)
- % Invitati votanti: 56% (WoW -2pp) <-- attenzione
- Eventi/gruppo/mese (run-rate): 2.8

[COHORT & SEGMENTI]
- Nuovi gruppi (<30gg): chiusura 66%
- Gruppi maturi (>=30gg): chiusura 79%
- Event type "trip": TTD più alto (+52%)

[DRIVER PANEL]
- Reminder inviati: +15% (correlati a +4pp vote rate nei gruppi medi)
- Deadline troppo brevi (<1h): chiusura -11pp

[FOUNDER DECISION BOX]
1) Priorità settimana: aumentare % votanti nei gruppi 5-8
2) Esperimento deciso: reminder + copy urgency
3) KPI leading monitorato: vote rate D+1
```

---

## 3) Alert automatici su soglie critiche

| Alert | Condizione | Finestra | Severità | Owner | Azione automatica |
|---|---|---|---|---|---|
| `ALERT_TTD_SPIKE` | `time_to_decision` mediana > 6h | rolling 24h | High | Product | Audit segmenti + check bug release |
| `ALERT_CLOSE_RATE_DROP` | `% eventi chiusi` < 65% | giorno | High | Product+Ops | Trigger task: analisi closed_reason |
| `ALERT_VOTER_RATE_DROP` | `% invitati votanti` < 50% | rolling 24h | Critical | Growth | Attiva reminder campaign fallback |
| `ALERT_FUNNEL_BREAK_DELIVERY` | invite delivered rate < 85% | 6h | Critical | Eng | Check provider push/SMS |
| `ALERT_GROUP_ACTIVITY_DROP` | eventi/gruppo/settimana < -20% WoW | settimana | Medium | Founder | Revisione onboarding gruppi |
| `ALERT_SEGMENT_REGRESSION` | segmento top cala >10pp vs baseline | settimana | Medium | Product Analyst | Deep dive segment-specific |

Canali: Slack `#founder-metrics` + email giornaliera alle 09:00.

---

## 4) Segmentazioni utili (priorità)

1. **Dimensione gruppo**: `2-4`, `5-8`, `9+` (impatta coordinamento e attrito voto).
2. **Fascia oraria creazione evento**: `morning`, `afternoon`, `evening`, `night`.
3. **Tipo evento**: `dinner`, `trip`, `meeting`, `other`.
4. **Maturità gruppo**: `new_group` (<30 giorni) vs `mature_group`.
5. **Piattaforma**: iOS/Android/Web (debug regressioni UX).

Regola: ogni report founder mostra massimo **3 segmentazioni insieme** per evitare overfitting interpretativo.

---

## 5) Rito settimanale di analisi + template decisionale

### Cadence (45 minuti, ogni lunedì)
- **10 min**: stato KPI core (semaforo + trend WoW).
- **15 min**: analisi funnel e 1 segmento prioritario.
- **10 min**: root cause ipotesi (prodotto, tech, comportamento).
- **10 min**: decisione esperimento + owner + deadline.

### Template decisionale (da compilare)
```md
# Weekly Analytics Decision Template
Settimana: <YYYY-WW>

## 1) Cosa è cambiato?
- KPI core:
  - TTD: <valore>, WoW <delta>
  - % chiusura: <valore>, WoW <delta>
  - % votanti: <valore>, WoW <delta>

## 2) Dove si osserva il problema/opportunità?
- Segmento: <es. gruppi 5-8>
- Funnel step impattato: <es. invite -> vote>
- Evidenza numerica: <dato>

## 3) Perché pensiamo stia accadendo?
- Ipotesi A:
- Ipotesi B:

## 4) Cosa decidiamo oggi?
- Esperimento/intervento:
- KPI leading:
- Guardrail metric:
- Owner:
- Data verifica:

## 5) Exit criteria
- Successo se:
- Stop se:
```

---

## 10 query/insight prioritari (settimanali)

1. **TTD mediana WoW e per segmento** (group size, event type, time slot).
2. **% eventi chiusi WoW** + breakdown `closed_reason`.
3. **% invitati votanti WoW** con focus su gruppi 5-8.
4. **Funnel conversion per step** (`created -> delivered -> voted -> closed`) con delta WoW.
5. **Eventi/gruppo/mese**: top e bottom decile gruppi attivi.
6. **Tempo medio alla prima votazione** dopo `event_created`.
7. **Impatto deadline** (`<1h`, `1-6h`, `>6h`) su close rate e voter rate.
8. **Performance piattaforma** (iOS/Android/Web) su voto e chiusura.
9. **Nuovi vs maturi gruppi**: gap su tutti KPI core.
10. **Distribuzione inviti per canale + delivery failure rate** (sanity check tecnico).

> Regola operativa founder: ogni settimana scegliere **1 solo KPI north-star in miglioramento** e massimo **2 esperimenti**.
