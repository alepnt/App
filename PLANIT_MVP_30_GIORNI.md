# PlanIt — MVP concreto (30 giorni)

## Obiettivo MVP
Validare in 30 giorni che **gruppi 20–40** riescano a chiudere una decisione sociale in meno tempo rispetto a WhatsApp.

**North Star MVP:**
- `Decision Time`: tempo dalla creazione evento alla decisione finale.
- Target MVP: mediana < 60 minuti per gruppi da 4–8 persone.

---

## Feature minime (solo ciò che serve)

### 1) Creazione evento in 20 secondi
Campi obbligatori:
- Titolo (es. "Cena sabato")
- 2–3 slot data/ora proposti
- Budget (basso/medio/alto)
- Zona (quartiere o area)
- Mood (easy/elegante/festa/tranquilla)

### 2) Votazione super rapida
Ogni invitato vota in 3 tap:
- disponibilità sugli slot
- fascia prezzo
- mood

### 3) Chiusura automatica decisione
Regole semplici:
- punteggio per combinazione (data + budget + mood)
- tie-break su massima partecipazione e minor conflitto
- deadline automatica (es. 2h): alla scadenza l’evento si chiude

### 4) Suggerimento venue (v1 manuale/semiautomatica)
- 3 opzioni compatibili con budget+zona+mood
- per MVP anche dataset locale curato a mano

### 5) Condivisione link invito
- link unico evento
- accesso ospite (senza onboarding pesante)

---

## Cosa NON fare nel MVP
- chat in-app complessa
- pagamenti
- split spese
- algoritmo ML avanzato
- marketplace pubblico

Se entra nel MVP e non riduce direttamente il Decision Time, va fuori.

---

## Piano operativo 30 giorni

### Settimana 1 — Fondazioni
- Definizione flusso UX (crea > invita > vota > chiudi)
- Prototipo cliccabile mobile-first
- Schema dati minimo (eventi, opzioni, voti, utenti)
- Tracking analytics (event_created, vote_submitted, decision_closed)

### Settimana 2 — Core prodotto
- Implementazione creazione evento
- Votazione singola schermata
- Calcolo combinazione vincente
- Deadline e auto-close

### Settimana 3 — Suggestion + inviti
- Integrazione suggerimenti locali (anche CSV iniziale)
- Link invito e gestione partecipanti
- Schermata risultato finale condivisibile

### Settimana 4 — Test reale e iterazione
- 20–30 gruppi pilota in una città
- Misurazione KPI chiave
- Iterazioni UX (solo attriti ad alto impatto)
- Preparazione beta pubblica limitata

---

## KPI da monitorare (must-have)
- `Time to Decision` (mediana)
- `% Eventi chiusi` entro deadline
- `% Invitati che votano`
- `Drop-off` su ogni step
- `Eventi per gruppo / mese`

Soglie di validazione iniziali:
- >65% eventi chiusi
- >55% invitati votanti
- almeno 2 eventi/mese per gruppo attivo

---

## Stima utenti in città media (go-to-market iniziale)

Ipotesi città 300k abitanti:
- target 20–40: ~35% => 105k
- socialmente attivi e smartphone-heavy: ~45% => 47k
- early adopters realistici anno 1: 4–8% => 1.9k–3.8k utenti

Conversione in gruppi:
- media 6 persone/gruppo
- gruppi attivi: ~320–630
- con 2 eventi/mese => 640–1260 eventi/mese

Con questi volumi puoi già validare retention e modello referral.

---

## Stress test (per vedere se regge davvero)

### Rischio 1: Nessuno vota
Mitigazioni:
- reminder automatico 30 min prima deadline
- default vote one-tap ("mi va bene opzione top")

### Rischio 2: Pareggi frequenti
Mitigazioni:
- tie-break trasparente
- fallback: host decide su top-2 con un tap

### Rischio 3: UX troppo lunga
Mitigazioni:
- massimo 1 schermata per azione critica
- obbligo di completamento in < 15 secondi per voto

### Rischio 4: Nessun valore rispetto a WhatsApp
Mitigazioni:
- output netto: “Decisione chiusa” + proposta locale
- condivisibile subito in chat

---

## Stack consigliato (veloce da costruire)
- Frontend: React + Next.js (mobile-first)
- Backend: Supabase/Firebase (auth, db, realtime)
- Analytics: PostHog/Amplitude
- Venue data: seed manuale + API successiva

---

## Monetizzazione (dopo product-market fit minimo)
1. Fee booking partner locali
2. Placement sponsorizzato venue
3. Pro per gruppi grandi/team

Trigger per iniziare monetizzazione:
- retention mese 2 stabile
- volume eventi sufficiente per partner locali

---

## Decisione strategica
L’idea è forte se resti su una promessa unica:

> **“Chiudere una decisione di gruppo in 60 secondi, senza chat infinita.”**

Qualsiasi feature che non accorcia questo percorso va rimandata.
