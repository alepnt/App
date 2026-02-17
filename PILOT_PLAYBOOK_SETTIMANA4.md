# Pilot Playbook Operativo — Settimana 4 (Head of Product Experimentation)

## North Star del pilot
- **Obiettivo primario:** ridurre il **Decision Time** medio per gruppo evento-to-decisione.
- **Vincolo operativo:** velocità di apprendimento > perfezione.
- **Regola di focus:** intervenire solo su ottimizzazioni ad alto impatto su Decision Time, attivazione e completamento decisione.

---

## 1) Piano pilot end-to-end

### 1.1 Setup pilot
- **Campione target:** 20–30 gruppi attivi in una singola città.
- **Composizione consigliata:**
  - 40% gruppi amici (uscite serali/weekend)
  - 30% gruppi famiglia/coppie
  - 30% gruppi lavoro/community
- **Dimensione gruppi:** 3–8 membri per massimizzare attrito decisionale realistico.
- **Criteri di inclusione:** almeno 2 decisioni collettive/settimana (cena, attività, location, orario).
- **Criteri di esclusione:** gruppi con unico decisore dominante (bassa utilità del prodotto).

### 1.2 Reclutamento (72h)
**Canali prioritari (veloci e misurabili):**
1. Network warm (community manager, ambassador locali, referral founder).
2. Partnership micro-locali (coworking, associazioni, community Telegram/WhatsApp locali).
3. Referral tester-to-tester (incentivo piccolo ma immediato).

**Funnel reclutamento:**
- Form candidatura breve (3 minuti): profilo gruppo, frequenza decisioni, disponibilità.
- Screening asincrono: punteggio fit (0–10) su frequenza decisioni + varietà contesti.
- Selezione a batch giornalieri (rolling admission).
- Conferma ingresso + slot onboarding.

**Target conversione operativo:**
- 80–100 lead → 40 colloqui leggeri → 20–30 gruppi attivi entro fine settimana.

### 1.3 Onboarding gruppi (standardizzato, 30 minuti)
**Formato:** 1 sessione live breve + checklist self-serve.

**Agenda onboarding:**
1. Perché del pilot e aspettative (3 min).
2. Setup gruppo e ruoli (admin + membri) (7 min).
3. Simulazione guidata “prima decisione” (10 min).
4. Best practice per ridurre attrito (5 min).
5. Q&A + prossimi passi (5 min).

**Kit onboarding:**
- Mini guida “Start in 10 minuti”.
- Video demo 90 secondi.
- FAQ errori frequenti.
- Canale supporto dedicato (es. WhatsApp/Slack).

### 1.4 Supporto operativo durante pilot
**Modello di supporto 3 livelli:**
- **L1 (community ops):** blocchi semplici, reminder, best practice.
- **L2 (product ops):** problemi di flusso decisione, attriti UX, workaround.
- **L3 (engineering on-call):** bug critici, outage, integrità dati.

**SLA interni consigliati:**
- Critico: risposta ≤30 min, workaround ≤2h.
- Alto: risposta ≤4h, fix/priorità entro 24h.
- Medio/Basso: raccolta in backlog sperimentale settimanale.

---

## 2) Protocollo test (durata, frequenza eventi, raccolta feedback)

### 2.1 Durata e struttura
- **Durata complessiva:** 4 settimane.
- **Cadence:**
  - Checkpoint KPI: giornaliero (core metrics), settimanale (coorte).
  - Sync interna tri-funzionale (Product/Design/Eng): 3 volte a settimana.
  - Touchpoint tester: 2 volte a settimana per gruppo.

### 2.2 Frequenza eventi richiesta ai tester
- **Minimo obbligatorio per gruppo:** 2 decisioni reali/settimana.
- **Target ideale:** 3–4 decisioni/settimana.
- **Eventi consigliati:** scelta locale, scelta orario, scelta attività, piano weekend.

### 2.3 KPI e strumentazione
**KPI primari (decision speed):**
- Median Decision Time (creazione decisione → outcome).
- % decisioni concluse entro 15 minuti.
- Drop-off nel funnel (invito → voto → decisione).

**KPI secondari (adozione/qualità):**
- Attivazione gruppo entro 24h dall’onboarding.
- Partecipazione media membri per decisione.
- NPS/CSAT post-evento.

**Event tracking minimo:**
- `group_created`, `member_joined`, `decision_started`, `option_added`, `vote_cast`, `decision_closed`, `decision_abandoned`.

### 2.4 Raccolta feedback (mixed-method)
**Quantitativo:**
- Dashboard giornaliera KPI per gruppo/coorte.
- Alert automatici su anomalie (es. aumento abandon rate >20%).

**Qualitativo:**
- Pulse survey ultra-breve post decisione (2 domande).
- Intervista settimanale 15 min con campione 6–8 gruppi.
- Debrief finale strutturato per tutti i group admin.

**Template pulse (in-app):**
1. “Quanto è stato facile arrivare a una decisione?” (1–5)
2. “Cosa ti ha rallentato di più?” (risposta breve)

---

## 3) Framework priorità bug/feedback (impatto su Decision Time)

## 3.1 Principio guida
Qualsiasi item viene prioritizzato per **riduzione attesa del Decision Time** + **frequenza del problema** + **rischio trust/retention**.

### 3.2 DT-Impact Score (0–100)
**Formula operativa:**

`DT-Impact Score = (Impatto su Decision Time x 0,45) + (Frequenza x 0,25) + (Blocco funnel x 0,20) + (Rischio fiducia x 0,10)`

Dove ogni componente è valutata su scala 0–100.

### 3.3 Classi di priorità
- **P0 (>=80):** blocco decisione o perdita dati, azione immediata.
- **P1 (60–79):** degrado forte di velocità/adozione, fix entro sprint corrente.
- **P2 (40–59):** attrito non bloccante, pianificazione successiva.
- **P3 (<40):** nice-to-have, rinvio salvo trend in crescita.

### 3.4 Guardrail “alto impatto only”
Un item entra in sviluppo solo se soddisfa almeno 1 criterio:
- riduce Decision Time stimato ≥15%;
- impatta ≥25% dei gruppi attivi;
- aumenta completamento decisione ≥10 punti percentuali.

---

## 4) Criteri go/no-go per beta pubblica limitata

## 4.1 Go criteria (tutti o quasi tutti soddisfatti)
- Almeno **70% gruppi attivi** dopo 4 settimane.
- **Median Decision Time** ridotto di almeno **25%** vs baseline iniziale.
- **Completion rate decisioni** ≥65%.
- Nessun bug P0 aperto >48h.
- CSAT medio ≥4/5 su facilità decisione.

### 4.2 No-go / Extend criteria
- Retention gruppi <50%.
- Decision Time in miglioramento <10%.
- Funnel join→vote con drop-off critico persistente.
- Più di 2 incidenti P0 nella stessa settimana.

### 4.3 Decisione finale
- **GO:** lanciare beta limitata in 1–2 nuove aree con stesso protocollo.
- **SOFT-GO:** espansione ridotta + 1 settimana extra hardening.
- **NO-GO:** congelare acquisizione nuovi utenti e concentrarsi su fix P0/P1.

---

## 5) Piano comunicazione ai gruppi tester

### 5.1 Principi
- Trasparenza: testiamo, impariamo, miglioriamo rapidamente.
- Ritmo costante: pochi messaggi ma prevedibili.
- Chiarezza aspettative: cosa chiediamo e cosa restituiamo.

### 5.2 Cadence comunicazione
- **T-3 giorni:** invito e conferma adesione.
- **T-1 giorno:** reminder onboarding + materiale quick start.
- **Settimanalmente:** update progress + cosa cambia nel prodotto.
- **Fine pilot:** survey finale + ringraziamento + next steps.

### 5.3 Ownership comunicazione
- Product Lead: messaggi strategici e update roadmap breve.
- Community Ops: reminder, supporto, follow-up survey.
- Design Research: gestione interviste qualitative.

---

## Timeline 4 settimane (owner & deliverable)

| Settimana | Obiettivo | Owner primario | Deliverable chiave |
|---|---|---|---|
| W1 | Reclutare e attivare 20–30 gruppi | Product Ops + Community Ops | Lista gruppi attivi, onboarding completati, baseline KPI |
| W2 | Stabilizzare uso e identificare colli di bottiglia | Product + Data Analyst | Report KPI settimanale, top 5 attriti, backlog P0/P1 ordinato |
| W3 | Iterazioni UX ad alto impatto | Product + Design + Eng | Rilasci mirati su funnel decisione, misure pre/post su Decision Time |
| W4 | Validazione finale e decisione go/no-go | Head of Product + Eng Lead | Decision memo go/no-go, piano beta limitata, retro pilot |

---

## Modelli messaggi

### A) Invito tester
**Oggetto:** Ti va di testare in anteprima [Nome Prodotto] con il tuo gruppo?

Ciao **[Nome]**,  
stiamo lanciando un pilot locale con pochi gruppi selezionati per rendere più veloce prendere decisioni insieme (uscite, orari, attività).  

Cerchiamo gruppi da **3 a 8 persone** disponibili per **4 settimane**, con almeno **2 decisioni reali a settimana**.  

Cosa ottieni:
- accesso anticipato;
- supporto diretto dal team prodotto;
- possibilità concreta di influenzare roadmap e UX.

Se ti interessa, compila questo form (3 minuti): **[link]**  
Grazie!  
**[Firma Team]**

### B) Reminder settimanale
Ciao **[Nome Gruppo]** 👋  
mini reminder del pilot di questa settimana:
1. fate almeno **2 decisioni reali** nel gruppo;
2. compilate il micro-feedback post decisione (30 secondi);
3. se qualcosa vi blocca, scriveteci qui: **[canale supporto]**.

Questa settimana abbiamo già migliorato **[feature/fix]** grazie ai vostri feedback 🙌

### C) Survey finale
**Oggetto:** Ultimo step pilot: 4 minuti di survey finale

Grazie per aver partecipato al pilot 🎉  
Per chiudere il test ci aiuta moltissimo una survey finale di 4 minuti: **[link survey]**

Ci interessano soprattutto:
- facilità nel raggiungere una decisione;
- momenti di frizione più forti;
- funzionalità che vi hanno fatto risparmiare più tempo.

Come grazie, riceverete **[reward/incentivo]** entro **[data]**.  
**[Firma Team]**

---

## Riti operativi (per mantenere velocità di apprendimento)
- Daily 15 min: metriche, blocchi, decisioni da prendere oggi.
- Triage P0/P1 a giorni alterni con owner nominato.
- “Kill fast” rule: se un’iterazione non migliora KPI in 3–5 giorni, rollback o rework.
- Memo settimanale 1 pagina: insight, decisioni prese, impatto misurato, next experiments.
