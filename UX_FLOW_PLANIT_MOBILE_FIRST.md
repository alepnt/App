# 1) Flusso UX completo (mobile-first)

## 1.1 Happy path (end-to-end)
1. **Home vuota / dashboard** → l’utente tocca **“Crea evento”**.
2. **Crea evento (1 schermata)** → inserisce titolo, data/ora proposta, luogo/opzione, durata voto.
3. **Conferma evento creato** → vede riepilogo rapido + CTA **“Invita ora”**.
4. **Invita (1 schermata)** → seleziona contatti (o copia link) e invia.
5. **Votazione aperta (schermata evento)** → partecipanti vedono opzioni e votano in pochi tap.
6. **Owner monitora stato** → vede numero voti e opzione in vantaggio.
7. **Chiudi decisione (1 schermata/modal)** → owner conferma opzione vincente.
8. **Decisione chiusa** → tutti vedono esito finale + dettaglio evento deciso.

## 1.2 Edge case principali
- **Nessun invitato risponde**: reminder leggero dopo X ore + possibilità di estendere scadenza voto.
- **Pareggio voti**: owner vede stato “Pareggio” e deve scegliere manualmente una delle opzioni in testa.
- **Invito non consegnato / contatto errato**: feedback immediato su invitati non validi + azione “Modifica inviti”.
- **Utente prova a chiudere senza voti minimi**: blocco soft con warning e opzioni “Aspetta” o “Chiudi comunque”.
- **Utente invitato apre link senza app/sessione**: flusso di accesso rapido e ritorno diretto alla schermata voto.

---

# 2) Specifiche per schermata

## 2.1 Schermata: Home / Dashboard
- **Obiettivo schermata**: far partire subito la creazione evento.
- **Campi/input necessari**: nessuno obbligatorio.
- **CTA primaria**: `Crea evento`.
- **CTA secondaria**: `Apri evento esistente`.
- **Microcopy consigliata**: “Organizza in 1 minuto. Crea, invita, vota, decidi.”
- **Errore più probabile + prevenzione**:
  - Errore: non capire da dove iniziare.
  - Prevenzione: un’unica CTA primaria ad alto contrasto, above the fold.

## 2.2 Schermata: Crea evento
- **Obiettivo schermata**: raccogliere i dati minimi per pubblicare un evento votabile.
- **Campi/input necessari**:
  1. Titolo evento (testo breve)
  2. Opzioni da votare (es. data/luogo in lista)
  3. Scadenza voto (data/ora)
- **CTA primaria**: `Crea e continua`.
- **CTA secondaria**: `Annulla`.
- **Microcopy consigliata**: “Bastano 3 dati: nome, opzioni, scadenza.”
- **Errore più probabile + prevenzione**:
  - Errore: scadenza precedente all’orario corrente.
  - Prevenzione: date passate disabilitate + validazione in tempo reale.

## 2.3 Schermata: Invita partecipanti
- **Obiettivo schermata**: inviare inviti senza attrito.
- **Campi/input necessari**:
  1. Selezione contatti (multi-select)
  2. Oppure link condivisibile (read-only + copy)
- **CTA primaria**: `Invia inviti`.
- **CTA secondaria**: `Salta per ora`.
- **Microcopy consigliata**: “Invita almeno 1 persona per iniziare il voto.”
- **Errore più probabile + prevenzione**:
  - Errore: nessun contatto selezionato.
  - Prevenzione: CTA primaria disabilitata finché count = 0 + hint “Seleziona almeno 1 contatto”.

## 2.4 Schermata: Vota opzioni (partecipante)
- **Obiettivo schermata**: permettere voto immediato e conferma chiara.
- **Campi/input necessari**:
  1. Selezione opzione (single choice o multi-choice secondo regola evento)
  2. Conferma voto
- **CTA primaria**: `Conferma voto`.
- **CTA secondaria**: `Modifica scelta` (dopo conferma, se consentito entro scadenza).
- **Microcopy consigliata**: “Scegli e conferma. Puoi cambiare fino alla scadenza.”
- **Errore più probabile + prevenzione**:
  - Errore: toccare conferma senza scelta.
  - Prevenzione: CTA disabilitata finché non c’è almeno un’opzione selezionata.

## 2.5 Schermata: Stato votazione (owner)
- **Obiettivo schermata**: monitorare avanzamento e decidere quando chiudere.
- **Campi/input necessari**: nessun input obbligatorio; pannello stato con conteggi.
- **CTA primaria**: `Chiudi decisione`.
- **CTA secondaria**: `Invia promemoria`.
- **Microcopy consigliata**: “Mancano 2 voti alla maggioranza.” (dinamico)
- **Errore più probabile + prevenzione**:
  - Errore: chiudere troppo presto per distrazione.
  - Prevenzione: modal di conferma con riepilogo voti e opzione vincente evidenziata.

## 2.6 Schermata/Modal: Chiusura decisione
- **Obiettivo schermata**: finalizzare la scelta in modo irreversibile e comprensibile.
- **Campi/input necessari**:
  1. Opzione vincente pre-selezionata (modificabile solo in caso di pareggio)
  2. Checkbox conferma “Ho verificato il risultato”
- **CTA primaria**: `Conferma decisione`.
- **CTA secondaria**: `Torna alla votazione`.
- **Microcopy consigliata**: “Dopo la conferma, il risultato non sarà più modificabile.”
- **Errore più probabile + prevenzione**:
  - Errore: conferma involontaria.
  - Prevenzione: doppia conferma leggera (checkbox + CTA finale).

---

# 3) Interaction budget (MVP)

## 3.1 Creare evento
- **Max tap target**: **7 tap**
  1. Crea evento
  2. Titolo (focus)
  3. Aggiungi opzione 1
  4. Aggiungi opzione 2
  5. Imposta scadenza
  6. Crea e continua
  7. Invia inviti (almeno 1 contatto già suggerito)
- **Tempo target**: **≤ 60 secondi**.

## 3.2 Votare
- **Max tap target**: **3 tap**
  1. Apri evento da notifica/link
  2. Seleziona opzione
  3. Conferma voto
- **Tempo target**: **≤ 15 secondi**.

## 3.3 Chiudere decisione (owner)
- **Max tap target**: **3 tap**
  1. Apri evento
  2. Chiudi decisione
  3. Conferma decisione
- **Tempo target**: **≤ 20 secondi**.

---

# 4) Wireframe low-fidelity (descrizione testuale)

## 4.1 Home
- **Header**: logo PlanIt + icona profilo.
- **Body**: card principale “Crea un nuovo evento”.
- **Footer sticky**: bottone pieno largo `Crea evento`.

## 4.2 Crea evento
- **Top bar**: back + titolo “Nuovo evento”.
- **Form verticale single-column**:
  - Input titolo
  - Blocco opzioni (lista con `+ Aggiungi opzione`)
  - Selettore scadenza
- **Bottom sticky actions**:
  - Primaria piena: `Crea e continua`
  - Secondaria testuale: `Annulla`

## 4.3 Invita
- **Top bar**: titolo “Invita”.
- **Body**:
  - Search contatti
  - Lista contatti con checkbox
  - Separatore “oppure”
  - Campo link evento + icona copia
- **Bottom sticky**:
  - Primaria: `Invia inviti`
  - Secondaria: `Salta per ora`

## 4.4 Vota
- **Top area**: titolo evento + countdown scadenza.
- **Body**: lista opzioni in card radio/checkbox grandi (touch area ampia).
- **Bottom sticky**:
  - Primaria: `Conferma voto` (disabled finché nessuna scelta)

## 4.5 Stato votazione (owner)
- **Top**: titolo + badge stato (`Aperta`, `Pareggio`, `Quasi chiusa`).
- **Body**:
  - Progress voti (es. 5/8)
  - Ranking opzioni (barre semplici)
- **Bottom sticky**:
  - Primaria: `Chiudi decisione`
  - Secondaria: `Invia promemoria`

## 4.6 Modal chiusura
- **Titolo**: “Conferma decisione”.
- **Contenuto**:
  - Opzione vincente evidenziata
  - Nota irreversibilità
  - Checkbox conferma
- **Azioni**:
  - Primaria distruttiva controllata: `Conferma decisione`
  - Secondaria: `Torna indietro`

---

# 5) Checklist usability test rapido (5 utenti)

## 5.1 Setup test
- Campione: 5 utenti target (20–40, abituati a chat/social).
- Metodo: test moderato da remoto o in presenza, 20 minuti a persona.
- Obiettivo: validare comprensione e velocità del flusso base MVP.

## 5.2 Task da far eseguire
1. Crea un evento con 2 opzioni e scadenza.
2. Invita almeno 2 persone.
3. Vota un’opzione come partecipante.
4. Chiudi la decisione come owner.

## 5.3 Metriche minime da raccogliere
- **Task success rate** per step (target ≥ 90%).
- **Tempo medio**:
  - Crea evento ≤ 60s
  - Voto ≤ 15s
  - Chiusura ≤ 20s
- **Errori critici** (target: 0 blocchi non recuperabili).
- **Numero tap reali** vs interaction budget.
- **Perceived clarity score** (1–5, target ≥ 4).

## 5.4 Checklist osservazione (si/no)
- L’utente identifica subito la CTA principale?
- Compila i campi senza chiedere chiarimenti?
- Capisce la differenza tra “invitare” e “votare”?
- Riesce a votare senza errori al primo tentativo?
- Capisce quando la decisione diventa definitiva?

## 5.5 Criteri di accettazione MVP UX
- Almeno 4/5 utenti completano tutto il flusso senza aiuto.
- Nessuna schermata con tasso confusione > 20%.
- Microcopy compreso senza spiegazioni esterne.
- Budget di interazione rispettato nel 80% dei casi.
