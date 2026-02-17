# UX Strategist — Interazioni rapide (voto in <15 secondi)

## Obiettivo operativo
Portare ogni invitato al **voto completo in meno di 15 secondi** con un flusso a singola schermata, linguaggio anti-ambiguità e azioni ridotte al minimo.

---

## 1) Design della schermata singola di voto

### Struttura (gerarchia verticale)
1. **Header compatto**
   - Titolo: `Vota in 3 tap`
   - Sottotitolo: `Tempo medio: 10–15 secondi`
   - Indicatore progresso testuale+visivo: `Passo 1/3`, barra 33/66/100.

2. **Blocco A — Disponibilità slot (tap 1)**
   - Label: `Quando puoi partecipare?`
   - 3–5 chip grandi, preformattate, es.:
     - `Ven 20:30`
     - `Sab 13:00`
     - `Dom 19:30`
   - Selezione singola (default) o multi-selezione solo se il modello evento lo richiede.

3. **Blocco B — Fascia prezzo (tap 2)**
   - Label: `Budget ideale per te?`
   - Opzioni a chip con copy non ambiguo:
     - `€ (0–20€)`
     - `€€ (21–40€)`
     - `€€€ (41€+)`
   - Una selezione obbligatoria.

4. **Blocco C — Mood (tap 3)**
   - Label: `Che atmosfera preferisci?`
   - 4 opzioni icon+label (touch target ampio):
     - `Relax`
     - `Social`
     - `Energico`
     - `Elegante`

5. **CTA sticky bottom (sempre visibile)**
   - Stato inattivo finché i 3 campi non sono completi.
   - Testo dinamico:
     - Incompleto: `Completa i 3 passaggi`
     - Completo: `Invia voto`

6. **Microcopy di sicurezza**
   - Riga sotto CTA: `Puoi modificare il voto anche dopo l'invio.`

### Comportamenti UI
- Tap con feedback immediato: stato selected <100 ms.
- Auto-scroll intelligente al blocco successivo dopo selezione.
- Haptic leggero su selezione (mobile).
- Nessun modal bloccante durante il voto.

---

## 2) Sequenza tap ottimizzata (velocità + percezione semplicità)

### Ordine consigliato
1. **Disponibilità slot** (decisione primaria, più concreta).
2. **Budget** (decisione numerica semplice, 3 opzioni).
3. **Mood** (decisione emotiva veloce).

### Perché questa sequenza funziona
- Riduce carico cognitivo: concreto → quantitativo → qualitativo.
- Evita stallo iniziale: partire dal mood allunga i tempi per ambiguità.
- Favorisce momentum: ogni scelta completa subito un blocco visivo.

### Ottimizzazioni di micro-interazione
- Preselezione opzionale “soft” solo dove legittima (es. slot più votato), ma sempre facilmente sovrascrivibile.
- “Tap-through” continuo: dopo terza selezione, CTA evidenziata con animazione leggera.
- Nessuna conferma intermedia: un solo invio finale.

---

## 3) Gestione stati incompleti

### Caso A — Esce a metà
- Salvataggio automatico locale + server dopo ogni tap (autosave incrementale).
- Banner discreto: `Bozza salvata`.

### Caso B — Ritorna più tardi
- Ripristino esatto stato precedente con timestamp: `Hai ripreso la bozza di 2 ore fa`.
- Focus automatico sul primo blocco non completato.
- CTA coerente con stato (inattiva/attiva).

### Caso C — Modifica voto inviato
- Pulsante secondario post-invio: `Modifica voto`.
- Riapre stessa schermata con valori precompilati.
- Traccia versione voto (`v1`, `v2`) lato sistema; ultima versione = valida.
- Microcopy anti-ansia: `Aggiorni solo la tua preferenza, nulla viene perso.`

### Regole di robustezza stato
- TTL bozza consigliato: 7 giorni.
- Conflitto multi-device: mostra versione più recente con opzione `Ripristina precedente`.
- Offline: queue locale e sync al reconnect con feedback chiaro.

---

## 4) Feedback immediato post-voto (conferma + next action)

### Conferma istantanea (inline, stessa schermata)
- Stato successo entro 300 ms percepiti:
  - Icona check + testo: `Voto registrato ✅`
  - Sotto: `Grazie! Hai completato in 12 secondi.` (se dato disponibile)

### Next action primaria
- CTA principale post-invio: `Vedi andamento del gruppo`
  - Porta a schermata trend/convergenza decisione.

### Next action secondarie
- `Modifica voto`
- `Condividi invito`

### Principio UX
- Dopo invio, evitare “dead end”: sempre un passo successivo utile.

---

## 5) Set metriche anti-dropoff specifiche

### Metriche di funnel
1. `vote_start_rate` = utenti che aprono schermata / invitati.
2. `step1_completion_rate` (slot selezionato).
3. `step2_completion_rate` (budget selezionato).
4. `step3_completion_rate` (mood selezionato).
5. `vote_submit_rate` = invii / aperture schermata.
6. `median_time_to_complete` (target <15s).
7. `p90_time_to_complete` (target <25s).

### Metriche di frizione
8. `backtrack_rate_per_step` (quante volte cambiano opzione prima submit).
9. `cta_disabled_tap_rate` (tap su CTA non attiva: segnala incomprensione).
10. `draft_resume_rate` (riprese bozza / bozze create).
11. `draft_abandonment_24h` (bozze non completate entro 24h).
12. `post_submit_edit_rate` (misura ripensamenti e chiarezza iniziale).

### Metriche qualitative rapide
13. `single-question_CES` post-voto: “È stato facile votare?” (1–5).
14. `reason_for_dropoff` su uscita anticipata (2 tap max: “tempo”, “indecisione”, “altro”).

### Soglie di attenzione consigliate
- Alert se `median_time_to_complete > 15s` per 3 giorni consecutivi.
- Alert se drop step1→step2 > 12%.
- Alert se `cta_disabled_tap_rate > 8%`.

---

## User flow dettagliato

1. **Ingresso da invito** → schermata voto aperta su `Passo 1/3`.
2. Utente seleziona slot → autosave + progresso `2/3` + scroll al budget.
3. Utente seleziona budget → autosave + progresso `3/3` + scroll al mood.
4. Utente seleziona mood → autosave + CTA diventa `Invia voto`.
5. Tap su `Invia voto` → submit server + conferma inline immediata.
6. Sistema mostra next action primaria `Vedi andamento del gruppo`.
7. Opzionale: utente modifica voto in qualsiasi momento da stessa entry point.

---

## Edge case coverage

- **Tap multipli rapidi su CTA**: de-bounce + stato `Invio in corso...`.
- **Errore rete in submit**: messaggio inline `Connessione instabile, riprovo...` + retry automatico.
- **Sessione scaduta**: refresh token trasparente, senza perdita bozza.
- **Nessuno slot disponibile**: fallback `Non posso in questi orari` + invio comunque consentito con altri 2 campi.
- **Ambiguità prezzo**: sempre range numerico esplicito, mai solo simboli €.
- **Accessibilità**: supporto screen reader con label descrittive e ordine focus corretto.
- **Touch error**: chip con area minima 44x44 pt.
- **Cambio lingua**: testi brevi, localizzati, senza idiomi ambigui.

---

## Specifiche UI testuali (anti-ambiguità)

- Titolo: `Vota in 3 tap`
- Slot label: `Quando puoi partecipare?`
- Budget label: `Budget ideale per te?`
- Mood label: `Che atmosfera preferisci?`
- CTA inattiva: `Completa i 3 passaggi`
- CTA attiva: `Invia voto`
- Conferma: `Voto registrato ✅`
- Support text: `Puoi modificare il voto anche dopo l'invio.`
- Errore rete: `Connessione instabile. Stiamo riprovando automaticamente.`

---

## 10 regole UX “non negoziabili” per velocità

1. **Un solo obiettivo per schermata**: completare e inviare il voto.
2. **Massimo 3 decisioni, massimo 1 tap ciascuna**.
3. **CTA sempre visibile (sticky) e semanticamente chiara**.
4. **Stato di selezione immediato (<100 ms)** per ogni tap.
5. **Nessun testo vago**: usare etichette operative e range numerici.
6. **Autosave a ogni passo**: zero perdita di progresso.
7. **Nessun popup intermedio** che interrompa il ritmo.
8. **Feedback di successo istantaneo + next action utile**.
9. **Modifica voto semplice e reversibile** senza penalità percepite.
10. **Misurare dropoff per step e reagire con soglie chiare**.
