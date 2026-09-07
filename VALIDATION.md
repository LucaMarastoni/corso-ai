# AI Academy — verifica del 7 settembre 2026

Aggiornamento SkillUp Home: vedere `SKILLUP_HOME.md`. I risultati browser qui sotto si riferiscono alla versione precedente della Home. Per l’aggiornamento sono stati eseguiti TypeScript, 23 test di logica e le due build; le suite browser sono aggiornate ma non rieseguite.

## Esiti

- TypeScript: `npx tsc --noEmit`, superato.
- Logica: `node --test tests/progress.test.mjs tests/courses.test.mjs`, 22/22 superati. Comprende regressioni AI e migrazione legacy, isolamento corsi, prerequisiti, matching/ordering, campionamento esame, ripristino tentativi, fallimento/superamento, ricompense idempotenti e attestati.
- Browser Chromium: `tests/mobile-ui.test.mjs` e `tests/ads-ui.test.mjs`, superati senza errori JavaScript osservati.
- AI: primo modulo completo nelle cinque fasi; persistenza bozze, checklist e risposte; achievement/competenze; migrazione; profilo; download attestato PNG. 40 combinazioni di viste e viewport da 320 a 768px, più tutte le 54 attività a 320 e 393px (108 combinazioni). Verifica testo al 200% e desktop 1440px.
- Ads: catalogo con due corsi e passaggio di corso, isolamento del salvataggio AI, ordering, matching persistente, esame di 12 domande senza soluzioni durante il tentativo, refresh, risultato con aree deboli, nuovo tentativo e 100%, attestato con sette competenze. 20 combinazioni di viste e viewport, più tutte le 61 attività a 320 e 393px (122 combinazioni).
- Nessun overflow orizzontale nelle combinazioni verificate. Target della navigazione e dei selettori AI almeno 44px; contenuto finale raggiungibile sopra la bottom navigation. Screenshot di catalogo, attività e attestati ispezionati.
- Build standard e variante statica: `npm run build` e `npm run build:pages`.
- Lint globale: 32 segnalazioni residue nei componenti UI preesistenti e nella pagina principale (effetti/ref, immagini native e semantica ARIA). Non è un controllo interamente verde; i nuovi componenti e il nuovo motore non aggiungono segnalazioni.

## Ripetere i test browser

Avviare `npm run dev`, quindi usare Playwright con Chromium installato. I test creano browser isolati e non modificano i salvataggi del browser dell’utente.

```sh
PLAYWRIGHT_MODULE=/percorso/playwright/index.mjs ACADEMY_URL=http://localhost:3001/ node tests/mobile-ui.test.mjs
PLAYWRIGHT_MODULE=/percorso/playwright/index.mjs ACADEMY_URL=http://localhost:3001/ node tests/ads-ui.test.mjs
```

Se Playwright è risolvibile normalmente, omettere `PLAYWRIGHT_MODULE`. Screenshot e attestati di QA sono in `outputs/learning-qa`, esclusi da Git.

## Limiti

Nessuna verifica su iPhone fisico, tastiera nativa o ascolto effettivo SpeechSynthesis. Safe area e testo alternativo restano disponibili. I tempi didattici sono stimati. Le applicazioni testuali usano autoverifica esplicita, non correzione automatica. Stato salvato solo in questo browser, senza sincronizzazione. Nessuna pubblicazione effettuata durante l’intervento locale.
