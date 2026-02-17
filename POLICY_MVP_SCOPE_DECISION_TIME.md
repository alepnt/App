# POLICY MVP — DECISION TIME FIRST

## 0) North Star (non negoziabile)
**Obiettivo unico MVP:** ridurre il *tempo alla decisione* (Decision Time) dal momento in cui nasce il bisogno di decidere al momento in cui il gruppo/utente conferma una scelta.

### Definizione operativa di Decision Time
- **Start:** creazione richiesta decisione (es. “dove andiamo?” / apertura votazione).
- **End:** decisione confermata (es. venue selezionata / scelta finale bloccata).
- **KPI primario:** median Decision Time (P50), con monitoraggio P75/P90.

### Regola di ferro
Se una feature **non dimostra impatto diretto** su Decision Time nel breve, va rimandata.

---

## 1) Framework decisionale per accettare/rifiutare feature
Usare questo framework per ogni nuova richiesta.

## 1.1 Gating (pass/fail)
Una feature entra in valutazione solo se passa **tutti** i gate:

1. **Impatto diretto su Decision Time**
   - Riduce step, attrito o attese nel percorso decisionale?
2. **Misurabilità immediata**
   - Possiamo misurare l’impatto in 1-2 sprint con eventi già tracciabili?
3. **Complessità compatibile con MVP**
   - Implementabile senza introdurre sistemi “pesanti” (es. pagamenti, marketplace, ML avanzato)?
4. **Nessuna deviazione dal core flow**
   - Non sposta il team su value non-core (engagement fine a sé stesso, monetizzazione prematura, social avanzato).

Se anche **un solo gate fallisce → RIFIUTO / LATER**.

## 1.2 Prioritizzazione (score)
Per le sole feature che passano i gate, applicare score 1-5:

- **DT Impact (40%)**: quanto riduce concretamente Decision Time.
- **Reach (20%)**: quota utenti/sessioni impattate.
- **Confidence (20%)**: evidenza qualitativa/quantitativa disponibile.
- **Effort inverse (20%)**: più basso effort, più alto punteggio.

**Score finale =** (DT×0.4) + (Reach×0.2) + (Conf×0.2) + (EffortInv×0.2)

### Soglie operative
- **≥ 4.0**: candidabile a **Now**
- **3.0 – 3.9**: **Next** (serve ulteriore evidenza)
- **< 3.0**: **Later/Rifiuto**

---

## 2) MVP Scope Policy (con esempi concreti)

## 2.1 Dentro lo scope MVP (ammesso)
Feature che:
- riducono i passaggi necessari a decidere;
- riducono l’ambiguità nella scelta;
- riducono tempi morti di coordinamento;
- migliorano chiarezza e velocità del voto/commit finale.

**Esempi ammessi**
- Reminder automatico ai non-votanti con deadline.
- Default intelligenti (es. proposte ordinate per pertinenza/tempo).
- Chiusura automatica votazione al raggiungimento soglia.
- UI semplificata per votare in 1 tap.

## 2.2 Fuori scope MVP (vietato ora)
Esplicitamente rimandato:
- chat complessa;
- pagamenti;
- split spese;
- ML avanzato;
- marketplace pubblico.

**Regola estesa:** anche qualsiasi variante “light” che introduce infrastruttura non necessaria al Decision Time.

**Esempi fuori scope**
- Wallet interno per pagare caparra.
- Matching ML multi-obiettivo “chi dovrebbe uscire con chi”.
- Vetrina pubblica di locali con ranking social.
- Chat con thread/reazioni/media.

## 2.3 Borderline policy
Se la feature è borderline:
1. definire ipotesi DT misurabile;
2. progettare esperimento ≤ 2 settimane;
3. fissare criterio kill/keep ex-ante;
4. se non batte baseline DT, si chiude.

---

## 3) Backlog disciplinato: Now / Next / Later

## Now (esecuzione immediata: 0-6 settimane)
Solo iniziative con impatto diretto e misurabile su Decision Time.

1. **Funnel decisionale strumentato end-to-end**
   - Eventi: start decisione, invito inviato/aperto, voto espresso, reminder inviato, decisione finalizzata.
2. **Friction killer sul voto**
   - Riduzione passaggi, CTA unica, stato decisione sempre visibile.
3. **Reminder + deadline automation**
   - Trigger automatici per inattivi e chiusura finestra decisionale.
4. **Regole di convergenza decisione**
   - Soglia minima voti, tie-break semplice e trasparente.
5. **Dashboard operativa DT**
   - P50/P75 Decision Time, drop-off per step, tempo medio per fase.

## Next (valutazione dopo evidenza: 6-12 settimane)
1. Esperimenti su copy/UX per aumentare rapidità risposta inviti.
2. Suggerimenti “semi-guidati” non-ML avanzato (regole semplici basate su contesto).
3. Miglioramenti notifiche multicanale solo se mostrano riduzione DT.

## Later (post-PMF o non-prioritario)
1. Chat avanzata.
2. Pagamenti e split spese.
3. Marketplace pubblico.
4. ML avanzato/personalizzazione predittiva.
5. Features social/gamification non correlate alla decisione.

---

## 4) Processo di Change Control

## 4.1 Governance: chi decide
- **DRI Prodotto (CPO/PM):** owner della decisione finale di scope.
- **Tech Lead:** valida fattibilità/effort/rischi tecnici.
- **Data/Analytics owner:** valida misurabilità e risultati.
- **CEO/Founder (solo escalation):** interviene se impatto strategico o conflitto tra funzioni.

## 4.2 Dati minimi obbligatori per approvare un change
Ogni proposta deve includere:
1. problema utente specifico;
2. ipotesi causale su Decision Time;
3. KPI target (es. -20% P50 DT);
4. evento/i necessari al tracking;
5. effort stimato (dev/design/data);
6. rischio di scope creep;
7. piano rollback/kill.

## 4.3 Riti e tempi
- **Intake settimanale (30 min):** raccolta nuove richieste.
- **Scope Review bisettimanale (45 min):** decisione Accept / Next / Reject.
- **Post-release review (fine sprint):** verifica impatto reale vs ipotesi.

## 4.4 Regole decisionali
- No dati minimi → **auto-rifiuto**.
- Nessun impatto DT dimostrabile → **Later**.
- Impatto DT positivo ma effort alto → test ridotto/esperimento prima di full build.
- Se metrica non migliora entro finestra concordata → **kill o rollback**.

---

## 5) Checklist pre-sviluppo obbligatoria (Definition of Ready — MVP)
Nessun task entra in sviluppo se non supera tutti i check:

1. **Outcome check**
   - [ ] Quale metrica DT migliora? (P50/P75/step latency)
2. **Problem check**
   - [ ] Evidenza del problema (dati funnel, interviste, ticket)?
3. **Scope check**
   - [ ] È dentro MVP scope policy?
   - [ ] Non introduce aree vietate (chat complessa, pagamenti, split, ML avanzato, marketplace)?
4. **Measurement check**
   - [ ] Eventi analytics definiti con naming e proprietà?
   - [ ] Baseline e target numerico espliciti?
5. **Experiment check**
   - [ ] Criterio di successo/fallimento definito prima dello sviluppo?
6. **Delivery check**
   - [ ] Stima effort e dipendenze chiarite?
   - [ ] Rollback plan pronto?
7. **Ownership check**
   - [ ] DRI nominato (Product + Tech + Data)?

Se una casella è vuota, il task torna in refinement.

---

## 6) Template decisione feature (1 pagina)

## Feature Decision One-Pager

**Feature name:**

**Owner (DRI):**

**Data proposta:**

### A) Problema da risolvere
- Quale blocco/frizione rallenta la decisione oggi?
- Evidenze (quant + qual):

### B) Ipotesi di impatto
- Ipotesi: “Se introduciamo X, allora Decision Time si riduce perché Y”.
- KPI primario: (es. P50 DT)
- KPI secondari guardrail: (es. completion rate, errori)
- Target numerico e finestra temporale:

### C) Scope & vincoli
- In scope MVP? (Sì/No)
- Toca aree vietate? (chat complessa/pagamenti/split/ML avanzato/marketplace)
- Rischio scope creep (Basso/Medio/Alto):

### D) Delivery
- Soluzione minima proposta (MVP slice):
- Alternative più leggere considerate:
- Effort stimato (Design/FE/BE/Data):
- Dipendenze:
- Rollback/Kill plan:

### E) Misurazione
- Eventi da tracciare:
- Baseline attuale:
- Criterio Keep / Kill:

### F) Decisione
- Esito: **ACCEPT NOW / PARK NEXT / REJECT**
- Motivazione sintetica:
- Firmatari: Product, Tech, Data

---

## 7) Esempi di feature rifiutate (e motivazione)

1. **“Aggiungiamo chat con thread e reaction” → RIFIUTATA**
   - Motivo: aumenta complessità comunicativa, non riduce direttamente il tempo di scelta, alto effort e rischio dispersione.

2. **“Integriamo pagamenti nel flow MVP” → RIFIUTATA**
   - Motivo: apre dominio compliance/ops non necessario alla decisione; impatto DT indiretto e non immediato.

3. **“Split spese automatico post-evento” → RIFIUTATA (Later)**
   - Motivo: valore post-decisione, non incide sul momento critico della convergenza.

4. **“Motore ML avanzato per suggerire venue” → RIFIUTATA (Later)**
   - Motivo: complessità dati/modello elevata; prima servono regole semplici e insight da comportamento reale.

5. **“Marketplace pubblico dei locali” → RIFIUTATA**
   - Motivo: sposta il prodotto da decision assistant a discovery platform; deviazione strategica nel MVP.

---

## 8) Decision discipline manifesto (da appendere al team)
- Una sola domanda prima di iniziare: **“Riduce Decision Time in modo misurabile?”**
- Se non possiamo misurarlo, non lo costruiamo.
- Se non è core, è dopo.
- La velocità di consegna non conta se non riduce il tempo di decidere.

