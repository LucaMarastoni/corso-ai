# AI Academy — redesign mobile

## Analisi dello stack

Il progetto usa React 19 e Vinext (convenzioni Next App Router), Tailwind e CSS globale. La route `/` ospitava contemporaneamente corso, mappa, lezione e sidebar di statistiche. Profilo, badge e attestato erano dialog Base UI. Non c'erano quattro pagine separate.

Componenti già riutilizzabili: Progress, Dialog, RadioGroup, Checkbox, Button e Card in `components/ui`. Il redesign compone queste primitive senza cambiare i file vendorizzati o installare dipendenze.

`app/progress.ts` mantiene stato, prerequisiti, XP, percentuale, streak e attestato. `app/page.tsx` legge e scrive `ai-course-journey-v2` in localStorage. `journey.ts` contiene i sei moduli; `achievements.ts` definisce gli sblocchi. Questi file e la chiave di salvataggio sono invariati.

## Architettura mobile

La route rimane `/`. I frammenti `#home`, `#lessons`, `#lesson`, `#progress`, `#profile` selezionano le viste e supportano collegamenti diretti e indietro/avanti del browser. Nessun router o servizio aggiuntivo.

- Home: saluto, una sola percentuale, corso e CTA Continua, percorso compatto, obiettivo successivo.
- Lezioni: la stessa mappa dei moduli usata su desktop, con stati di blocco conservati.
- Lezione: lo stesso player didattico desktop, con header dedicato, blocchi editoriali, richiamo e azione primaria. L'audio ha peso secondario; nelle sfide non risolte soltanto Controlla ha stile primario.
- Progressi: overview, streak, prossimo traguardo, tre badge iniziali con espansione esplicita, attestato.
- Profilo: contenuto condiviso con il dialog desktop; identità locale, livello, XP, competenze ottenute, attestato e materiali.

Su mobile una slide diventa vista solo entrando nella lezione: la Home non accredita letture invisibili. La formula e i requisiti didattici restano invariati.

## Token e componenti

`app/tokens.css` centralizza colori semantici, scala 4–64, quattro radius, due ombre, tipografia, line-height, durata delle transizioni e dimensioni di header, pulsanti e navigazione.

`app/mobile.css` contiene gli stili Academy e il layout responsive. Breakpoint principale: 768px; a 375px i sette selettori di attività passano su due righe per mantenere target di almeno 44px. I breakpoint desktop esistenti a 950 e 1000px rimangono.

`components/academy.tsx` espone:

- AppHeader, XPChip, BottomNavigation;
- AcademyButton (primary, secondary, ghost, icon), AcademyCard (default, highlight, reward, success, dark);
- SectionHeader, ProgressSummary, CourseHeroCard, JourneyCard, ObjectiveCard;
- LessonHeader, LessonBlock, InsightCard;
- BadgeTile, StreakCard, CertificateCard, ProfileContent.

ProgressBar riusa direttamente la primitiva Progress. La composizione di statistiche e achievement usa AcademyCard, senza un altro sistema di card. Header, corso, contenuto di lezione e profilo sono condivisi fra viewport.

## CSS rimosso

Eliminate le vecchie regole per mobile-progress, mobile-dashboard, mobile-achievement-strip e mobile-module-picker, le media query mobile sovrapposte a 700/520/390px, e gli stili profile-metrics/profile-progress/profile-badges non più usati. Eliminato `overflow-x: hidden` dal body: i test misurano gli overflow reali, senza mascherarli. Il CSS dei componenti desktop non coinvolti è preservato per limitare regressioni.

## Scelte e limiti

Il prompt allegato era testuale; non era incluso un file di mockup. La direzione segue quindi le indicazioni scritte e gli asset del progetto. Il corso reale ha 42 attività (18 slide, 18 sfide, 6 laboratori), non 24 lezioni: le statistiche usano i dati reali. I blocchi editoriali conservano integralmente i testi originali, senza inventare titoli o cambiare le lezioni. Non sono stati introdotti reset o preferenze assenti nel progetto.

La migrazione dei token riguarda il nuovo sistema e i controlli condivisi. Gli stili legacy di desktop, attestato e collectible mantengono alcuni valori preesistenti: una loro migrazione completa avrebbe esteso il refactor oltre il redesign mobile richiesto.
