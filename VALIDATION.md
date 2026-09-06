# AI Academy — verifica del redesign mobile (6 settembre 2026)

## Esiti

- TypeScript: `npx tsc --noEmit`, superato.
- Logica: `node --experimental-strip-types --test tests/progress.test.mjs`, 6/6 superati. Prerequisiti, XP non duplicabili, 600 XP finali, streak, ripristino, attestato, copertura dei contenuti.
- Browser Chromium: `tests/mobile-ui.test.mjs`, superato. Nessun errore JavaScript osservato.
- 40 combinazioni: Home, elenco Lezioni, Lezione, Progressi, Profilo a 320, 360, 375, 390, 393, 414, 430, 768px. Nessuno scroll orizzontale, controlli nel viewport, bottom navigation non sovrapposta al contenuto finale dopo lo scroll, target navigazione e selettori di attività >=44px.
- 84 combinazioni aggiuntive: tutte le 42 attività a 320 e 393px, inclusi testi lunghi, sfide e laboratori.
- Interazioni: completamento reale del primo modulo, tre risposte corrette, laboratorio, sblocco, espansione/riduzione badge 3/6, dialog badge, modifica nome e persistenza al reload, download quaderno e attestato PNG.
- Desktop a 1440px: mappa, player e sidebar visibili; bottom navigation nascosta. Screenshot delle viste mobile a 390px e desktop ispezionati.
- Test aggiuntivo a 320px con testo al 200%: nessun overflow nelle cinque viste.
- Safe area: `viewport-fit=cover`, env(safe-area-inset-top/bottom), spazio di compensazione nel contenuto. Non verificato su un iPhone fisico; Chromium non certifica il comportamento di Safari iOS o della tastiera nativa.
- Build standard `npm run build` e variante statica `npm run build:pages`: superate.
- Lint globale: 35 errori residui, contro 40 della baseline Git iniziale. Nessuna nuova segnalazione (confronto per file/regola/messaggio). Restano regole React sugli effetti/ref esistenti, immagini native e semantica ARIA legacy, e segnalazioni nei componenti UI vendorizzati. Il lint dei nuovi componenti Academy e del test browser passa.
- Nessuna dipendenza applicativa aggiunta. `npm ci` segnala 11 vulnerabilità delle dipendenze esistenti; nessun aggiornamento automatico fuori ambito.

## Ripetere la verifica browser

Usare Playwright disponibile nell'ambiente di sviluppo, con Chromium installato, e avviare `npm run dev`. Il test crea un browser isolato e non modifica il localStorage del browser dell'utente.

```sh
PLAYWRIGHT_MODULE=/percorso/assoluto/playwright/index.mjs ACADEMY_URL=http://localhost:3001/ node tests/mobile-ui.test.mjs
```

Se Playwright è già risolvibile normalmente, omettere PLAYWRIGHT_MODULE. Il default ACADEMY_URL è localhost:3001. Playwright è uno strumento di QA esterno al manifest dell'applicazione.

## Limiti mantenuti

Audio SpeechSynthesis: conservati controlli, voci italiane, fallback ed errori; l'ascolto effettivo sul dispositivo dell'utente non è verificato. Il testo resta sempre disponibile. Registrazione WebMCP non verificata in un contesto che supporti modelContext. Tempi di apprendimento stimati, non misurati. Nessun backend, login o sincronizzazione aggiunto. Nessuna modifica pubblicata al sito esistente durante questo intervento locale.
