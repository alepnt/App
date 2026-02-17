# Pilot Playbook Operativo — Settimana 4 (Head of Product Experimentation)

## North Star del pilot
- **Obiettivo primario:** ridurre il **Decision Time** medio per gruppo evento-to-decisione.
- **Vincolo operativo:** velocità di apprendimento > perfezione.
- **Regola di focus:** intervenire solo su ottimizzazioni ad alto impatto su Decision Time, attivazione e completamento decisione.

---

## 1) Piano pilot end-to-end

## 1.1 Reclutamento gruppi (20–30)
**Target gruppi**
- 3–8 persone per gruppo (core use case decisioni sociali veloci).
- Almeno 2 eventi/uscite pianificabili nelle 4 settimane.
- Mix di segmenti: studenti, giovani professionisti, community hobby/sport.

**Canali di reclutamento (priorità)**
1. Community manager/ambassador locali.
2. Referral da primi gruppi attivati (incentivo "porta un gruppo").
3. Outreach diretto in community chat esistenti (Telegram/WhatsApp/Discord).

**Funnel di reclutamento (SLA 72h)**
- Giorno 0: contatto + mini pitch (30 sec value proposition).
- Giorno 1: call/DM di qualificazione (5 min) + screening form.
- Giorno 2: conferma idoneità + prenotazione onboarding.
- Giorno 3: gruppo attivato con owner identificato.

**Criteri minimi di idoneità**
- Disponibilità a usare il prodotto per 4 settimane.
- Disponibilità a rispondere a pulse survey rapide (≤60 sec).
- Presenza di un "Group Champion" (referente operativo).

## 1.2 Onboarding gruppi
**Formato onboarding (30 minuti, remoto o in presenza)**
- 5' contesto + obiettivi pilot.
- 10' setup guidato (creazione gruppo, primo evento, voto).
- 10' simulazione end-to-end con caso reale del gruppo.
- 5' allineamento su supporto, canali e aspettative.

**Pacchetto onboarding**
- Quickstart one-pager (3 azioni: crea evento, invita, chiudi decisione).
- Video demo <2 min.
- FAQ "bloccanti frequenti".
- Contatti supporto + tempi risposta.

**Activation checklist (D0–D2)**
- Gruppo creato ✅
- ≥70% membri invitati ✅
- Primo evento creato ✅
- Primo voto completato ✅
- Primo feedback qualitativo raccolto ✅

## 1.3 Supporto operativo
**Canali supporto**
- Canale async dedicato (WhatsApp/Telegram) per Group Champion.
- Office hour bisettimanale (30 min).
- Escalation path per bug bloccanti (<4h first response).

**SLA supporto**
- Critico (bloccante decisione): presa in carico <1h, workaround <4h.
- Alto impatto: presa in carico <8h, fix/priorità entro sprint corrente.
- Medio/Basso: backlog triage settimanale.

**Ritmo operativo interno**
- Daily 15' Pilot Ops stand-up (Product + Design + Tech + CX).
- Triage bug/feedback 2 volte a settimana.
- Retro settimanale su KPI + decisioni di iterazione.

---

## 2) Protocollo test (durata, frequenza eventi, feedback)

## 2.1 Durata e struttura
- **Durata totale:** 4 settimane.
- **Baseline:** primi 3–4 giorni per misurare comportamento iniziale.
- **Iterazioni:** 2 cicli rapidi (fine settimana 2 e fine settimana 3).

## 2.2 Frequenza eventi target
- Minimo **1 evento/settimana** per gruppo.
- Target ideale: **2 eventi/settimana** per gruppi attivi.
- Soglia rischio churn: 0 eventi in 7 giorni -> trigger intervento CX.

## 2.3 KPI da tracciare
**Core KPI**
- Median Decision Time per gruppo/evento.
- Time-to-first-vote.
- Completion rate del voto.

**KPI di adozione**
- % gruppi attivi settimanalmente.
- # eventi creati per gruppo.
- % membri attivi per evento.

**KPI qualitativi**
- CSAT micro-survey post-evento.
- Perceived clarity del flusso (1–5).
- Top 3 frizioni riportate.

## 2.4 Raccolta feedback (multi-layer)
- **In-product pulse** dopo chiusura decisione (1 domanda + campo libero).
- **Check-in settimanale** con Group Champion (10 minuti).
- **Intervista finale** (20 minuti) su valore percepito e frizioni residue.

**Regola anti-rumore**
Un insight entra in roadmap solo se soddisfa almeno una condizione:
1. Ricorre in ≥3 gruppi diversi.
2. Impatta direttamente Decision Time.
3. Blocca la completion del flusso decisionale.

---

## 3) Framework priorità bug/feedback (focus Decision Time)

## 3.1 Score di priorità (DT-Impact Score)
Formula rapida:

**Priorità = Impatto su Decision Time x Frequenza x Severità UX x Confidenza**

Dove ogni fattore è valutato 1–5.

- **Impatto DT:** quanto riduce/aumenta il tempo decisionale.
- **Frequenza:** quanti gruppi colpiti (% base pilot).
- **Severità UX:** blocca, rallenta o solo infastidisce.
- **Confidenza:** qualità evidenza (analytics + qualitativo).

## 3.2 Classi operative
- **P0 (immediato):** blocca voto/chiusura decisione, impatto DT massimo.
- **P1 (questa settimana):** rallenta significativamente il flusso core.
- **P2 (se resta capacità):** miglioramenti percepiti ma non critici.
- **P3 (parcheggio):** nice-to-have o feedback singolo non validato.

## 3.3 Policy di esecuzione
- Durante pilot, capacity allocation:
  - 70% bug/frizioni P0-P1 su flusso core.
  - 20% miglioramenti UX ad alto leverage validati da dati.
  - 10% debt tecnico minimo necessario.
- No redesign estesi durante pilot.

---

## 4) Criteri go/no-go per beta pubblica limitata

## 4.1 Gate quantitativi (go)
Tutti i seguenti criteri devono essere rispettati nelle ultime 2 settimane:
- Riduzione median Decision Time ≥20% vs baseline iniziale.
- ≥60% gruppi attivi weekly.
- Completion rate voto ≥75%.
- Nessun bug P0 aperto >72h.

## 4.2 Gate qualitativi (go)
- CSAT medio post-evento ≥4/5.
- Frizione #1 identificata con piano fix chiaro e owner assegnato.
- Group Champion: ≥70% dichiara "riutilizzerei il prodotto".

## 4.3 No-go / Hold conditions
- KPI core non migliorano dopo 2 iterazioni consecutive.
- Persistono P0 ricorrenti sul flusso decisionale.
- Alto tasso abbandono onboarding (>40% gruppi non attivati D+3).

**Decisione finale:** review con Product, Engineering, Design, Ops; outcome = Go / Go con limiti / No-Go con piano correttivo 2 settimane.

---

## 5) Piano comunicazione ai gruppi tester

## 5.1 Cadence comunicazione
- D-3: invito e aspettative pilot.
- D0: kickoff + quickstart.
- Ogni settimana: reminder uso + mini-report "cosa abbiamo migliorato".
- Fine pilot: ringraziamento + survey finale + eventuale accesso prioritario beta.

## 5.2 Tone of voice
- Trasparente: "state co-costruendo il prodotto".
- Breve e orientato ad azione.
- Focus su impatto reale (tempo risparmiato nelle decisioni).

## 5.3 Messaggi chiave
- Obiettivo: decisioni di gruppo più rapide, meno chat dispersive.
- Cosa chiediamo: uso reale + feedback sintetico.
- Cosa offriamo: supporto diretto, miglioramenti rapidi, riconoscimento early tester.

---

## Timeline 4 settimane (owner + deliverable)

| Settimana | Obiettivo | Attività chiave | Owner | Deliverable |
|---|---|---|---|---|
| W1 | Attivazione pilot | Reclutamento 20–30 gruppi, onboarding, setup tracking KPI baseline | Head of Product Exp + CX Lead | 20–30 gruppi attivi, dashboard baseline, backlog iniziale |
| W2 | Stabilizzare uso | Monitoraggio eventi, supporto intensivo, triage P0/P1, iterazione UX #1 | Product Manager + Engineering Lead + Designer | Fix critici rilasciati, report KPI W2, decision log |
| W3 | Ottimizzare conversione decisione | Iterazione UX #2 su frizioni top, coaching gruppi a bassa attività, validazione miglioramenti | Product + Design + CX | Delta KPI vs baseline, evidenze qual/quant consolidate |
| W4 | Valutazione go/no-go | Chiusura raccolta dati, survey/interviste finali, business review beta limitata | Head of Product Exp + Leadership trio | Raccomandazione Go/No-Go, piano beta limitata, comunicazione finale tester |

---

## Modelli messaggi

## A) Invito tester
**Oggetto:** Ti va di entrare nel pilot Planit (4 settimane)?

Ciao **[Nome]**,  
stiamo lanciando un pilot locale con pochi gruppi selezionati per rendere le decisioni di gruppo molto più veloci (uscite, cene, attività).

**Cosa ti chiediamo:**
- usare Planit per 4 settimane con il tuo gruppo;
- creare almeno 1 evento a settimana;
- condividere feedback rapido (60 secondi).

**Cosa ottieni:**
- supporto diretto dal team prodotto;
- miglioramenti rapidi basati sui tuoi input;
- accesso prioritario alla beta successiva.

Se vuoi partecipare, rispondi con **"CI STO"** e ti mandiamo i prossimi step (2 minuti).  
Grazie! 🙌

## B) Reminder settimanale
Ciao **[Nome]** 👋  
check veloce pilot settimana **[X]**:
- questa settimana prova a lanciare almeno **1 decisione reale** nel gruppo;
- se trovi attriti, scrivici subito qui (anche in una riga);
- abbiamo già migliorato: **[1-2 miglioramenti concreti]**.

Obiettivo: ridurre ancora il tempo per arrivare a una decisione condivisa.  
Grazie per il contributo!

## C) Survey finale
Ciao **[Nome]**, siamo all'ultimo step 🎯  
ci aiuti con una survey finale (3 minuti)? **[link]**

Domande chiave:
1. Quanto è stato più rapido decidere con Planit? (1–5)
2. In quali passaggi hai perso più tempo?
3. Qual è il miglioramento #1 che vorresti subito?
4. Useresti Planit nelle prossime settimane? (Sì/No, perché)

Il tuo feedback guida la decisione per la beta limitata. Grazie davvero per la co-creazione 🚀
