# AI Academy — corsi e progressione

## Struttura condivisa

`app/courses.ts` è il registro dei corsi. Ogni voce contiene identità, metadati, cover, moduli, achievement, competenze, chiave di persistenza e configurazioni opzionali per materiali, fonti ed esame. `app/course-types.ts` definisce il contratto. La selezione usa `?course=google-ads` (accetta anche lo slug); le viste mantengono gli hash esistenti.

Catalogo, player, progressi, profilo e attestato usano gli stessi componenti. Il motore legge i dati del corso attivo, senza rami speciali per AI o Google Ads. Non sono state aggiunte dipendenze, servizi o autenticazione.

## Persistenza e compatibilità

- AI: `ai-course-journey-v3`; fallback legacy `ai-course-journey-v2` conservato. Contenuti AI, identificatori attività, ricompense e soglie restano quelli del percorso esistente.
- Google Ads: `ai-academy-google-ads-v3`. Stato autonomo per attività, bozze, risposte, XP, streak, achievement, competenze, nome e attestato.
- Ogni stato include `courseId`; un record appartenente a un altro corso non viene importato. Un corso senza configurazione legacy non importa i vecchi progressi AI.
- Completamenti idempotenti: ripasso, refresh e tentativi ripetuti non assegnano due volte gli XP. Le evidenze acquisite non vengono sostituite modificando una bozza.

## Ciclo didattico e ricompense

Impara → Prova → Verifica → Applica → Sblocca. Le fasi successive richiedono il completamento delle precedenti. La lettura richiede conferma esplicita; la pratica e l’applicazione richiedono testo e checklist dichiarate. Non viene simulata una valutazione semantica automatica dei testi.

| Attività | XP |
|---|---:|
| Micro-slide confermata | 5 |
| Pratica | 20 |
| Verifica corretta / simulazione superata | 30 |
| Applicazione | 50 |
| Sblocco modulo | 50 |

Soglie condivise: Esploratore 0, Operatore 150, Prompt Architect 450, Analista 750, Applied Intelligence 1050 XP. Gli achievement celebrano risultati; le competenze registrano modulo, evidenza e data. Il vecchio corso AI già completato mantiene i suoi 600 XP storici, senza premi retroattivi inventati; un percorso AI nuovo totalizza 1350 XP.

## Google Ads Accelerator

Sette moduli: Fondamenti, Search Campaigns, Targeting & Audience, Budget & Bidding, Performance & Conversioni, Campaign Strategy, Exam Simulation. Sono presenti 21 micro-slide e 61 attività complessive, per 1515 XP. Le esercitazioni usano il caso aziendale fittizio CorsaLab, domande con spiegazioni, confronti, ordinamento della struttura account, abbinamento delle metriche e applicazioni con checklist.

Sei achievement: Auction Ready, Keyword Hunter, Quality Signal, ROAS Pilot, Conversion Tracker, Campaign Strategist. Sette competenze coprono struttura Search, keyword, audience, bidding, misurazione, ottimizzazione e ragionamento sui casi. Cover geometrica originale, senza marchi Google.

La simulazione estrae 12 quesiti originali da una banca di 18: due per ciascuno dei sei argomenti studiati. È accessibile dopo i prerequisiti del modulo 7. Nessun timer; risposte persistenti, nessuna soluzione visibile prima della consegna. Il risultato mostra percentuale, argomenti con errori, collegamenti al ripasso e spiegazioni. Si può riprovare; vengono conservati fino a dieci tentativi. La soglia locale dell’80% sblocca la prosecuzione. Un nuovo campione può condividere domande con quello precedente.

Il percorso si concentra su Search e misurazione: non sostituisce tutti i percorsi specialistici Skillshop. Simulazione e attestato sono dichiarati non ufficiali, senza promessa di superamento dell’esame Google.

## Fonti editoriali

Contenuti originali e parafrasati, verificati il 7 settembre 2026. Le fonti sono registrate nel corso e accessibili dal player:

- [Ad Rank e asta](https://support.google.com/google-ads/answer/1722122?hl=it)
- [Quality Score diagnostico](https://support.google.com/google-ads/answer/6167118?hl=it)
- [Corrispondenza keyword](https://support.google.com/google-ads/answer/7478529?hl=it)
- [Targeting e osservazione](https://support.google.com/google-ads/answer/7365594?hl=en)
- [Strategie di offerta](https://support.google.com/google-ads/answer/6167148?hl=it)
- [Metriche di conversione](https://support.google.com/google-ads/answer/6270625?hl=en)
- [Misurazione delle conversioni](https://support.google.com/google-ads/answer/1722022?hl=en)
- [Ottimizzazione](https://support.google.com/google-ads/answer/9451527?hl=en)
- [Struttura account](https://support.google.com/google-ads/answer/1704396?hl=en)
- [Budget giornaliero medio](https://support.google.com/google-ads/answer/6385083?hl=en)
- [Certificazioni ufficiali Skillshop](https://support.google.com/google-ads/answer/9702955?hl=en)
