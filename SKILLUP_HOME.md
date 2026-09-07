# SkillUp Home

Home integrata nel progetto esistente seguendo i riferimenti desktop e mobile: topbar con ricerca, brand geometrico, sidebar, banner fotografico, sei card in griglia, progressi circolari, citazione, prossima attività e challenge. Su mobile compaiono inizialmente tre card orizzontali, widget in sequenza e navigazione inferiore fissa. “Vedi tutti” espande il catalogo; ricerca e bookmark funzionano localmente.

I titoli editoriali AI e marketing conducono rispettivamente ai percorsi esistenti Basi di Intelligenza Artificiale e Google Ads Accelerator. Gli altri quattro corsi sono anteprime dichiarate “In arrivo”. Anche SkillUp Pro è dichiarato non disponibile, senza acquisti o iscrizioni simulate. Nome e progressi provengono dai salvataggi reali; il tempo di studio non viene inventato. Non viene riprodotta una falsa barra di sistema del telefono.

La conferma delle micro-slide è ora una sola azione “Continua”: salva il completamento, assegna gli XP e passa all’attività successiva, anche fra Impara e Prova. Un secondo evento riferito alla vecchia slide non salta contenuti. Tornare su una slide già letta permette di continuare senza nuovi XP. Verifiche e applicazioni mantengono il feedback prima della prosecuzione.

Immagini generate con lo strumento integrato ImageGen, ottimizzate in WebP e salvate in `public/skillup/`: hero, ai, marketing, webdesign, analytics, security, automation. Prompt finali e nomi dei file sono in `public/skillup/ASSETS.json`. Il logo è un SVG originale. Gli asset sono locali, senza richieste a librerie fotografiche esterne.

Verifiche di questo aggiornamento: TypeScript, 23 test di logica (incluso avanzamento atomico su entrambi i corsi, refresh e doppio evento), build standard e statica. Le suite browser sono state adattate ai nuovi selettori e alla prosecuzione in un clic, ma non rieseguite per questa Home. Le verifiche browser documentate in precedenza descrivono la versione precedente.
