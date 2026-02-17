# Tracking & Analytics Plan MVP (Founder Team)

## Obiettivo
Impostare un sistema analytics **minimo ma azionabile** per migliorare la velocità decisionale, senza proliferazione di eventi non utili.

---

## 1) Tracking plan completo

### Naming convention
- Eventi: `snake_case`, verbo al passato (`event_created`, `vote_submitted`, `decision_closed`).
- Proprietà: `snake_case`, niente sinonimi (`group_size_bucket` sempre uguale in tutti gli eventi).
- Timestamp: UTC ISO-8601 (`event_timestamp`).
- ID chiave: `event_id`, `group_id`, `user_id` come stringhe stabili.
- Versioning: `schema_version` obbligatorio su ogni evento.

### Proprietà comuni (tutti gli eventi)
| Proprietà | Tipo | Obbligatoria | Esempio | Note implementative |
|---|---|---:|---|---|
| `event_name` | string | ✅ | `vote_submitted` | valorizzato lato tracking SDK |
| `event_timestamp` | datetime UTC | ✅ | `2026-02-17T10:12:00Z` | preferire server timestamp |
| `event_id` | string | ✅ | `ev_101` | ID evento decisionale |
| `group_id` | string | ✅ | `grp_88` | unità di analisi principale |
| `user_id` | string | ✅ | `usr_55` | per eventi automatici usare `system` |
| `platform` | enum | ✅ | `ios` | `ios` / `android` / `web` |
| `app_version` | string | ✅ | `1.7.0` | utile per regressioni |
| `schema_version` | string | ✅ | `1.0` | backward compatibility |

### Tabella tracking pronta da implementare
> Scope minimo: 3 eventi core richiesti + 1 evento tecnico per funnel affidabile.

| Event name | Quando scatta | Proprietà specifiche (tipo) | Obbl. | KPI abilitati |
|---|---|---|---:|---|
| `event_created` | alla creazione dell'evento | `event_type` (enum: `dinner/trip/meeting/other`), `invited_count` (int), `group_size_bucket` (enum: `2_4/5_8/9_plus`), `time_slot_bucket` (enum: `morning/afternoon/evening/night`), `deadline_at` (datetime, nullable) | ✅ | volume eventi, eventi/gruppo/mese, segmentazioni |
| `invite_delivered` | quando l'invito è effettivamente recapitato al singolo invitato | `invitee_user_id` (string), `delivery_channel` (enum: `push/in_app/sms`), `delivery_status` (enum: `delivered/failed`) | ✅ | funnel step created→delivered, affidabilità canali |
| `vote_submitted` | al submit del voto | `vote_option_id` (string), `response_time_sec` (int), `is_vote_changed` (bool) | ✅ | % invitati votanti, latenza risposta, drop-off delivered→vote |
| `decision_closed` | alla chiusura decisione | `closed_reason` (enum: `majority_reached/deadline_reached/manual_close/cancelled`), `time_to_decision_sec` (int), `voters_count` (int), `invited_count_snapshot` (int) | ✅ | Time to Decision, % eventi chiusi, qualità chiusura |

### KPI dictionary (definizioni univoche)
| KPI | Definizione operativa |
|---|---|
| Time to Decision | mediana di `decision_closed.time_to_decision_sec` |
| % eventi chiusi | `count(distinct decision_closed.event_id) / count(distinct event_created.event_id)` |
| % invitati votanti | `count(distinct vote_submitted.user_id,event_id) / count(distinct invite_delivered.invitee_user_id,event_id where delivered)` |
| Drop-off funnel | conversioni step: `created → delivered → voted → closed` |
| Eventi/gruppo/mese | `count(event_created.event_id)` per `group_id` nel mese |

---

## 2) Dashboard MVP founder team

### Mock testuale — Dashboard Giornaliera (D-1)
```text
[HEADER]
Data: 2026-02-16 | Gruppi attivi: 128 | Alert critici: 1

[KPI CORE]
- Time to Decision (mediana): 3h25m (target < 4h) [verde]
- % Eventi chiusi: 71% (target > 75%) [giallo]
- % Invitati votanti: 54% (target > 60%) [rosso]
- Eventi creati: 214 (DoD +12%)

[FUNNEL D-1]
Created 214 -> Delivered 1.102 utenti -> Voted 595 -> Closed 152
Conv: 100% -> 78% -> 54% -> 71%
Drop maggiore: Delivered -> Voted (-24pp)

[SEGMENTI PRIORITARI]
- Gruppo 2-4: vote rate 62%
- Gruppo 5-8: vote rate 49% (critico)
- Evening: TTD +35% vs media

[AZIONI OGGI]
1) reminder automatico +45 min su gruppi 5-8
2) verifica deliverability push su Android 1.7.0
```

### Mock testuale — Dashboard Settimanale (WTD)
```text
[HEADER]
Settimana 2026-W07 | Gruppi attivi: 603 | WoW eventi: +9%

[TREND KPI 7G]
- TTD mediana: 3h40m (WoW -18m)
- % Eventi chiusi: 74% (WoW +3pp)
- % Invitati votanti: 56% (WoW -2pp) [attenzione]
- Eventi/gruppo/mese run-rate: 2.8

[COHORT]
- Nuovi gruppi (<30gg): close rate 66%
- Gruppi maturi (>=30gg): close rate 79%

[DRIVER]
- Deadline <1h: close rate -11pp
- Event type trip: TTD +52% vs baseline

[DECISION BOX]
Focus settimana: aumentare vote rate gruppi 5-8
Esperimento: reminder + copy urgenza
Leading KPI: vote rate D+1
```

---

## 3) Alert automatici su soglie critiche

| Alert | Condizione | Finestra | Severità | Owner | Azione |
|---|---|---|---|---|---|
| `ALERT_TTD_SPIKE` | mediana TTD > 6h | rolling 24h | High | Product | deep dive per segmento + check release |
| `ALERT_CLOSE_RATE_DROP` | % eventi chiusi < 65% | giorno | High | Product/Ops | analisi `closed_reason` entro 24h |
| `ALERT_VOTER_RATE_DROP` | % invitati votanti < 50% | rolling 24h | Critical | Growth | attiva reminder fallback |
| `ALERT_DELIVERY_ISSUE` | delivered rate < 85% | 6h | Critical | Engineering | check provider push/SMS immediato |
| `ALERT_ACTIVITY_DROP` | eventi/gruppo/settimana < -20% WoW | settimana | Medium | Founder | review onboarding/retention |

Canali suggeriti: Slack `#founder-metrics` + digest email ore 09:00.

---

## 4) Segmentazioni utili (priorità)
1. **Dimensione gruppo**: `2_4`, `5_8`, `9_plus`.
2. **Fascia oraria creazione**: `morning`, `afternoon`, `evening`, `night`.
3. **Tipo evento**: `dinner`, `trip`, `meeting`, `other`.
4. **Maturità gruppo**: `<30 giorni` vs `>=30 giorni`.
5. **Piattaforma**: `ios/android/web`.

Regola anti-overanalysis: in dashboard executive mostrare massimo 3 segmentazioni contemporaneamente.

---

## 5) Rito settimanale di analisi + template decisionale

### Rito (45 minuti, ogni lunedì)
- 10' KPI core (semaforo + WoW)
- 15' funnel + segmento prioritario
- 10' ipotesi root cause (prodotto/tech/comportamento)
- 10' decisione: 1 focus KPI + max 2 esperimenti

### Template decisionale
```md
# Weekly Analytics Decision Template
Settimana: <YYYY-WW>

## 1) Cosa è cambiato?
- TTD: <valore>, WoW <delta>
- % chiusura: <valore>, WoW <delta>
- % votanti: <valore>, WoW <delta>

## 2) Dove succede?
- Segmento: <es. gruppi 5-8>
- Funnel step: <es. delivered -> vote>
- Evidenza: <dato>

## 3) Perché (ipotesi)?
- H1:
- H2:

## 4) Cosa decidiamo oggi?
- Esperimento/intervento:
- Leading KPI:
- Guardrail:
- Owner:
- Review date:

## 5) Exit criteria
- Successo se:
- Stop se:
```

---

## 10 query/insight prioritari da leggere ogni settimana

1. **TTD mediana WoW totale e per segmento chiave.**
```sql
SELECT week, group_size_bucket, percentile_cont(0.5) WITHIN GROUP (ORDER BY time_to_decision_sec) AS ttd_p50
FROM decision_closed
GROUP BY 1,2;
```

2. **% eventi chiusi WoW + breakdown motivo chiusura.**
```sql
SELECT week, closed_reason, COUNT(DISTINCT event_id) AS closed_events
FROM decision_closed
GROUP BY 1,2;
```

3. **% invitati votanti per bucket dimensione gruppo.**

4. **Funnel conversion rate per step (`created→delivered→voted→closed`).**

5. **Eventi/gruppo/mese con top/bottom decile (rischio churn).**

6. **Tempo medio alla prima votazione dopo creazione evento.**

7. **Impatto deadline (`<1h`, `1-6h`, `>6h`) su close rate e vote rate.**

8. **Confronto iOS vs Android vs Web su submit voto e drop-off.**

9. **Nuovi gruppi vs maturi: gap su tutti KPI core.**

10. **Delivery health: failure rate per canale invito e versione app.**

> Regola founder: ogni settimana selezionare **1 KPI north-star** da migliorare e al massimo **2 esperimenti** attivi.
