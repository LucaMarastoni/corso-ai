export const lessons = [
  {
    "title": "Capire l’AI",
    "time": 8,
    "kind": "Fondamenti",
    "pacing": "4 lettura + 4 pratica",
    "goal": "Alla fine saprai distinguere una bozza utile da una risposta che richiede verifica.",
    "sections": [
      {
        "title": "Prima di cominciare",
        "paragraphs": [
          "Questo percorso è per chi parte da zero. Servono un browser, un posto dove prendere appunti e circa un’ora. Non devi saper programmare. I tempi sono indicativi: fermati sugli esercizi e torna indietro quando serve.",
          "Puoi svolgere tutto usando gli esempi inclusi, senza account esterni. Se hai già accesso a un assistente AI testuale, puoi provarvi i prompt: apri una nuova conversazione, incolla il testo della richiesta, invialo e leggi la risposta. Le funzioni e le condizioni dipendono dal servizio scelto. Qui non è integrato un assistente AI.",
          "Il risultato finale sarà un piccolo kit di contenuti per un’attività inventata: una descrizione, tre domande frequenti e un invito al contatto. Imparerai a prepararlo e a controllarlo."
        ]
      },
      {
        "title": "Che cosa significa “generativa”",
        "paragraphs": [
          "Intelligenza artificiale è un nome ampio per sistemi che svolgono compiti come riconoscere schemi, classificare informazioni o generare contenuti. In questo corso ci concentriamo sull’AI generativa testuale: sistemi che producono testo a partire da una richiesta.",
          "Un modello linguistico ha appreso regolarità da molti esempi durante l’addestramento. Quando risponde, genera una sequenza di frammenti di testo, chiamati token, in base al contesto disponibile. Questa descrizione è semplificata, ma spiega un punto essenziale: un testo convincente non è automaticamente vero.",
          "Un assistente può aiutarti a riscrivere, riassumere, confrontare alternative e preparare bozze. Può anche fraintendere una consegna, omettere un dettaglio o produrre informazioni inventate. La qualità della scrittura e l’accuratezza dei fatti sono due cose diverse."
        ]
      },
      {
        "title": "Una bozza è un punto di partenza",
        "paragraphs": [
          "Se fornisci un elenco di servizi e chiedi di riscriverlo in modo chiaro, hai un riferimento con cui confrontare la risposta. Se chiedi prezzi aggiornati di un concorrente senza fornire fonti, la risposta richiede un controllo esterno. L’accesso a strumenti di ricerca non va dato per scontato.",
          "Tratta l’AI come un collaboratore a cui dare un compito delimitato: tu scegli l’obiettivo, fornisci il materiale e decidi se il risultato è utilizzabile."
        ]
      }
    ],
    "practiceTime": 4,
    "taskTitle": "Scegli il compito adatto",
    "task": "Dedica 1 minuto a leggere questi compiti e 3 a motivare la scelta: A) rendere più chiaro un testo fornito; B) sapere con certezza il prezzo attuale di un prodotto senza fonti; C) generare cinque titoli per una pagina. Quali sono buoni punti di partenza? Quale richiede informazioni verificate?",
    "solution": "A e C sono buoni punti di partenza: puoi confrontare la riscrittura con l’originale e valutare i titoli. Anche questi output vanno controllati. B richiede una fonte aggiornata, come il listino ufficiale: la sicurezza del tono non basta. Se hai scelto B come risposta garantita, rileggi “Una bozza è un punto di partenza”."
  },
  {
    "title": "Scrivere una richiesta utile",
    "time": 12,
    "kind": "Prompt",
    "pacing": "4 lettura + 8 pratica",
    "goal": "Saprai scrivere un prompt con obiettivo, contesto, vincoli e formato.",
    "sections": [
      {
        "title": "Il prompt è la tua consegna",
        "paragraphs": [
          "Un prompt è il messaggio con cui chiedi qualcosa all’AI. Non è una formula magica: è una consegna. “Scrivi un testo bello” lascia aperte molte decisioni. “Scrivi una descrizione di 60 parole per chi cerca una riparazione di biciclette” rende il risultato più valutabile.",
          "Usa quattro ingredienti: obiettivo (che cosa deve fare), contesto (per chi e con quali informazioni), vincoli (cosa rispettare o evitare), formato (come presentare il risultato). Non devono esserci sempre tutti: per una richiesta semplice bastano poche parole. Aggiungili quando riducono un’ambiguità concreta."
        ]
      },
      {
        "title": "Il nostro caso: Officina Pedale",
        "paragraphs": [
          "Officina Pedale è un’attività completamente inventata. Questi sono i soli fatti disponibili: ripara biciclette urbane, offre manutenzione dei freni e sostituzione delle camere d’aria, riceve su appuntamento tramite modulo di contatto. Non conosciamo indirizzo, prezzi, tempi di lavorazione, certificazioni o orari.",
          "I dati mancanti non devono diventare promesse. Possiamo chiedere all’AI di segnalarli o ometterli. Nei prompt useremo solo questo caso fittizio. Non servono dati di clienti reali."
        ],
        "example": "Obiettivo: scrivi una descrizione per la pagina iniziale di Officina Pedale.\nContesto: il pubblico sono persone che usano la bici in città. Fatti disponibili: riparazione bici urbane, manutenzione freni, sostituzione camere d’aria; appuntamenti tramite modulo.\nVincoli: tono semplice e concreto, massimo 60 parole. Non aggiungere prezzi, orari, indirizzi, garanzie o tempi. Se manca un dato, segnalalo separatamente.\nFormato: un titolo di massimo 8 parole, un paragrafo e un elenco dei dati mancanti."
      },
      {
        "title": "Dare materiale da usare",
        "paragraphs": [
          "Se chiedi un riassunto, incolla il testo da riassumere e separalo dalle istruzioni con un’etichetta, per esempio “TESTO DA RIASSUMERE”. Se vuoi un certo stile, fornisci un breve esempio e chiarisci che deve servire come modello di tono, non come fonte di nuovi fatti.",
          "Assegnare un ruolo, come “agisci da copywriter”, può orientare il tono, ma non sostituisce fatti e criteri. La frase “sei un esperto” non rende la risposta verificata."
        ]
      }
    ],
    "practiceTime": 8,
    "taskTitle": "Trasforma una richiesta vaga",
    "task": "Primi 2 minuti: individua cosa manca in “Fammi una presentazione della mia officina”. Nei successivi 3 minuti riscrivila con i quattro ingredienti, usando i fatti di Officina Pedale. Negli ultimi 3 prova il prompt nel tuo assistente, se disponibile, oppure confrontalo con la soluzione. Indica quali informazioni hai deciso di non inventare.",
    "solution": "Una possibile consegna: “Scrivi una presentazione di Officina Pedale per ciclisti urbani. Usa solo questi fatti: riparazione bici urbane, manutenzione freni, sostituzione camere d’aria, appuntamento tramite modulo. Tono chiaro, massimo 60 parole. Non aggiungere informazioni. Restituisci titolo e paragrafo; separa i dati mancanti”.\n\nControlla: 1) c’è un compito preciso? 2) il pubblico è indicato? 3) i fatti sono presenti? 4) ci sono limiti verificabili? 5) il formato è chiaro? Se manca una voce, correggi la richiesta prima di proseguire."
  },
  {
    "title": "Migliorare la risposta",
    "time": 10,
    "kind": "Conversazione",
    "pacing": "3 lettura + 7 pratica",
    "goal": "Saprai dare un feedback preciso e ottenere una seconda versione più utile.",
    "sections": [
      {
        "title": "La prima risposta non è la consegna finale",
        "paragraphs": [
          "Dopo una prima bozza, confronta il testo con il prompt. Ha rispettato il formato? Ha aggiunto informazioni? Il linguaggio è adatto al pubblico? Prima di cambiare tutto, individua uno o due problemi specifici.",
          "Dire “non mi piace” non spiega come migliorare. Dire “togli gli aggettivi generici, mantieni solo i servizi forniti e riduci a 40 parole” indica un intervento controllabile. Puoi chiedere due alternative, confrontarle e spiegare quali parti vuoi conservare."
        ]
      },
      {
        "title": "Una revisione guidata",
        "paragraphs": [
          "Questa è una risposta simulata, scritta per l’esercizio. Non proviene da una chiamata a un modello. Cerca le informazioni che non trovi nel brief."
        ],
        "example": "BOZZA DA CORREGGERE\n“Officina Pedale, leader in città da vent’anni, ripara qualsiasi bicicletta in 24 ore. Il nostro team certificato offre i prezzi più bassi del mercato. Vieni a trovarci senza appuntamento!”\n\nFEEDBACK UTILE\n“Elimina anzianità, certificazioni, confronti sui prezzi e tempi, perché non sono nel brief. Limita i servizi alle bici urbane, ai freni e alle camere d’aria. Correggi l’accesso: si riceve su appuntamento tramite modulo. Restituisci una versione di massimo 45 parole.”"
      },
      {
        "title": "Quando continuare e quando ripartire",
        "paragraphs": [
          "Nella stessa conversazione puoi richiamare una bozza precedente, ma è utile ripetere i vincoli cruciali. Non dare per scontato che ogni dettaglio rimanga sempre disponibile: conversazioni lunghe e allegati possono essere gestiti diversamente dai vari sistemi.",
          "Quando cambi attività o pubblico, una nuova conversazione con un breve riepilogo può evitare confusione. Non esiste un numero perfetto di revisioni: fermati quando i criteri sono soddisfatti. Se un errore fattuale ricompare, verifica la fonte e correggi il dato."
        ]
      }
    ],
    "practiceTime": 7,
    "taskTitle": "Revisiona con criterio",
    "task": "Dedica 2 minuti a elencare le affermazioni non supportate della bozza. In 3 minuti scrivi il tuo messaggio di revisione. In altri 2 minuti scrivi o genera la nuova versione e confrontala con il brief. Evita di chiedere soltanto “rendila più professionale”.",
    "solution": "Affermazioni non supportate: leader in città, vent’anni, qualsiasi bicicletta, 24 ore, team certificato, prezzi più bassi. “Senza appuntamento” contraddice il brief.\n\nVersione possibile: “Officina Pedale si occupa della riparazione di biciclette urbane, della manutenzione dei freni e della sostituzione delle camere d’aria. Per richiedere un appuntamento, compila il modulo di contatto.”\n\nIl risultato funziona perché conserva i servizi confermati e non introduce promesse. Valuta i fatti prima dell’eleganza dello stile."
  },
  {
    "title": "Controllare prima di usare",
    "time": 10,
    "kind": "Verifica",
    "pacing": "4 lettura + 6 pratica",
    "goal": "Saprai individuare informazioni inventate e ridurre i dati condivisi.",
    "sections": [
      {
        "title": "Le allucinazioni: informazioni plausibili ma errate",
        "paragraphs": [
          "Si parla spesso di “allucinazione” quando un sistema genera contenuti falsi o non supportati, presentandoli come credibili. Può trattarsi di un indirizzo, una citazione, una statistica o un servizio mai indicato. Non è necessario che il testo sembri strano.",
          "Chiedere “sei sicuro?” può produrre una correzione, ma non è una verifica indipendente. Anche chiedere una fonte non basta: il riferimento potrebbe essere inesatto. Quando un fatto conta, apri la fonte originale, controlla che esista e che sostenga proprio quell’affermazione."
        ]
      },
      {
        "title": "Tre controlli, nell’ordine",
        "paragraphs": [
          "1. Fedeltà: confronta la risposta con i materiali forniti. Cerchia nomi, numeri, promesse e affermazioni assolute. Ogni elemento deve avere un supporto.",
          "2. Adeguatezza: verifica che il testo risponda al compito, rispetti il pubblico e non usi stereotipi o etichette offensive. Un testo corretto può comunque essere inadatto alla situazione.",
          "3. Utilizzabilità: controlla formato, chiarezza, errori e passaggi operativi. Un pulsante che dice “prenota” non prova che esista davvero una prenotazione funzionante. Prima di pubblicare per un cliente, fai approvare le informazioni sull’attività."
        ]
      },
      {
        "title": "Condividi solo quello che serve",
        "paragraphs": [
          "Per esercitarti usa dati inventati. Nelle attività reali evita di incollare password, credenziali, documenti riservati o elenchi completi di clienti. Chiediti quali informazioni siano davvero necessarie e se puoi sostituirle con esempi o segnaposto.",
          "Sostituire il nome non garantisce che un testo sia anonimo: indirizzi, dettagli degli ordini o combinazioni di informazioni possono identificare una persona. Le regole del servizio e quelle della tua organizzazione vanno controllate prima di usare dati reali. Questo corso non richiede alcuna condivisione di dati personali."
        ]
      }
    ],
    "practiceTime": 6,
    "taskTitle": "Trova gli errori prima del cliente",
    "task": "In 3 minuti controlla questa bozza simulata: “Officina Pedale, in via Roma 18, garantisce riparazioni in giornata a partire da 15 euro. Ripara bici urbane e riceve su appuntamento tramite modulo”. Segna ciò che è supportato, ciò che manca e la fonte che consulteresti. Negli ultimi 3 minuti spiega come useresti un messaggio di un cliente come esempio senza copiarne dati personali o dettagli riservati.",
    "solution": "Supportato: bici urbane e appuntamento tramite modulo. Non supportato: via Roma 18, riparazioni in giornata, 15 euro. Chiedi conferma al titolare e usa documenti approvati, come il listino, se disponibili. Fino ad allora elimina quei dettagli.\n\nPer l’esempio del cliente, crea un messaggio fittizio che conservi solo il tipo di problema. Evita nome, recapiti, numero ordine e dettagli identificativi. Non basta chiedere all’AI di “dimenticare” dati già inviati. Se non sai se un dato si possa condividere, non usarlo nell’esercizio."
  },
  {
    "title": "Il tuo primo mini-progetto",
    "time": 12,
    "kind": "Laboratorio",
    "pacing": "2 lettura + 10 pratica",
    "goal": "Realizzerai un piccolo kit di contenuti applicando il metodo completo.",
    "sections": [
      {
        "title": "La consegna",
        "paragraphs": [
          "Ora metti insieme i quattro passaggi: definisci il compito, fornisci il contesto, rivedi il risultato e controlla i fatti. L’obiettivo è preparare contenuti per Officina Pedale, non realizzare un sito funzionante.",
          "Consegna tre elementi: una descrizione di massimo 50 parole, tre domande frequenti con risposte brevi e un testo per un pulsante di massimo 5 parole. Usa solo i fatti del brief. Se una domanda richiede dati mancanti, sostituiscila con una domanda a cui puoi rispondere oppure segnala il dato da ottenere."
        ]
      },
      {
        "title": "Il brief da tenere accanto",
        "paragraphs": [
          "Attività inventata: Officina Pedale. Pubblico: chi usa una bici in città. Servizi: riparazione di biciclette urbane, manutenzione dei freni, sostituzione delle camere d’aria. Accesso: su appuntamento tramite modulo di contatto. Tono: semplice, concreto e cordiale. Non sono disponibili prezzi, indirizzo, orari o tempi di lavorazione.",
          "Puoi usare un assistente esterno con questo brief fittizio. Senza account, scrivi tu una prima bozza e applica gli stessi controlli: eserciterai progettazione e revisione, anche senza generazione automatica."
        ]
      }
    ],
    "practiceTime": 10,
    "taskTitle": "Prepara il kit e controllalo",
    "task": "Minuti 1–3: scrivi il prompt completo. Minuti 4–6: genera o scrivi il kit. Minuti 7–8: trova almeno un possibile miglioramento e applicalo. Minuti 9–10: confronta tutto con il brief, conta le parole della descrizione e controlla il pulsante. Salva prompt, versione finale e una breve nota su cosa hai corretto.",
    "solution": "PROMPT DI RIFERIMENTO\n“Usa solo i fatti di questo brief: Officina Pedale ripara bici urbane, esegue manutenzione freni e sostituisce camere d’aria. Riceve su appuntamento tramite modulo. Scrivi una descrizione entro 50 parole, tre FAQ con risposte entro 25 parole ciascuna e un testo per pulsante entro 5 parole. Tono semplice e cordiale. Non inventare dati; elenca a parte ciò che manca.”\n\nESEMPIO DI CONSEGNA\nDescrizione: “Officina Pedale si occupa della tua bici urbana: riparazioni, manutenzione dei freni e sostituzione delle camere d’aria. Si riceve su appuntamento. Compila il modulo di contatto per richiederlo.”\nFAQ 1: “Di quali biciclette vi occupate?” — “Ci occupiamo di biciclette urbane.”\nFAQ 2: “Quali servizi offrite?” — “Riparazioni di bici urbane, manutenzione dei freni e sostituzione delle camere d’aria.”\nFAQ 3: “Come richiedo un appuntamento?” — “Compila il modulo di contatto per richiedere un appuntamento.”\nPulsante: “Richiedi un appuntamento”.\nDati da chiedere: indirizzo, orari, prezzi, tempi e modalità di conferma.\n\nAUTOVALUTAZIONE: assegna 1 punto per ciascun criterio: tutti i servizi sono corretti; non ci sono fatti inventati; sono presenti i tre formati; i limiti di parole sono rispettati; l’appuntamento è richiesto, non presentato come già confermato. Obiettivo 5/5: correggi le voci mancanti. Non c’è un’unica formulazione giusta."
  },
  {
    "title": "Verifica e prossimi passi",
    "time": 8,
    "kind": "Quiz",
    "pacing": "1 ripasso + 7 quiz",
    "goal": "Verificherai ciò che hai imparato e saprai cosa ripassare.",
    "sections": [
      {
        "title": "Il metodo da portare con te",
        "paragraphs": [
          "Prima definisci il risultato. Poi fornisci informazioni e vincoli. Leggi la bozza, chiedi correzioni precise e verifica prima di usare. È un ciclo: obiettivo → richiesta → risposta → revisione → controllo.",
          "Ricorda quattro parole: obiettivo, contesto, vincoli, formato. E una domanda finale: “Quali affermazioni posso davvero sostenere?”. Conserva il prompt e il kit del laboratorio: sono il tuo primo esempio di lavoro."
        ]
      },
      {
        "title": "Come usare la verifica",
        "paragraphs": [
          "Dedica circa 7 minuti alle otto domande e alle spiegazioni. Per superare l’autoverifica servono almeno 6 risposte corrette. Il punteggio misura il riconoscimento dei concetti; il mini-progetto serve a verificarne l’applicazione.",
          "Se una risposta è sbagliata, rileggi la tappa indicata. Dopo il corso, ripeti il laboratorio su un’altra attività inventata. Cambia pubblico e servizi: verifica se riesci ad adattare il prompt invece di copiarlo senza ragionare."
        ]
      }
    ],
    "practiceTime": 0,
    "taskTitle": "",
    "task": "",
    "solution": ""
  }
];
export const questions = [
  {
    "text": "Una risposta è scritta bene e sembra sicura. Che cosa puoi concludere?",
    "options": [
      "Che i fatti sono stati verificati",
      "Che è leggibile, ma i fatti vanno ancora controllati",
      "Che non occorre rileggerla"
    ],
    "correct": 1,
    "explanation": "Lo stile non garantisce accuratezza. Confronta i fatti con il materiale e le fonti. Ripasso: tappa 1."
  },
  {
    "text": "Quale richiesta è più facile da valutare?",
    "options": [
      "Scrivi qualcosa di bello",
      "Agisci da massimo esperto mondiale",
      "Scrivi 3 titoli entro 8 parole ciascuno usando i servizi del brief"
    ],
    "correct": 2,
    "explanation": "La terza richiesta specifica risultato, limite e riferimento. Ripasso: tappa 2."
  },
  {
    "text": "L’AI aggiunge un prezzo non presente nel brief. Cosa fai?",
    "options": [
      "Lo elimino o lo verifico con un listino approvato",
      "Lo tengo perché sembra plausibile",
      "Chiedo di scriverlo con più sicurezza"
    ],
    "correct": 0,
    "explanation": "Un dato mancante non può diventare una promessa. Ripasso: tappa 4."
  },
  {
    "text": "Il testo è troppo generico. Quale feedback aiuta?",
    "options": [
      "Non mi piace",
      "Sei sicuro?",
      "Togli gli slogan, cita solo i tre servizi e resta entro 40 parole"
    ],
    "correct": 2,
    "explanation": "Una correzione specifica consente di valutare la nuova versione. Ripasso: tappa 3."
  },
  {
    "text": "Quale materiale usi per esercitarti?",
    "options": [
      "L’elenco completo dei clienti",
      "Un caso inventato con i soli dettagli necessari",
      "Un documento riservato togliendo soltanto il titolo"
    ],
    "correct": 1,
    "explanation": "I dati fittizi permettono la pratica senza condividere dati reali. Ripasso: tappa 4."
  },
  {
    "text": "Una risposta cita una fonte. Qual è il controllo utile?",
    "options": [
      "Verificare soltanto che il link sia blu",
      "Aprire la fonte e verificare che sostenga l’affermazione",
      "Chiedere alla stessa AI se è sicura"
    ],
    "correct": 1,
    "explanation": "La presenza di una citazione non prova che sia corretta o pertinente. Ripasso: tappa 4."
  },
  {
    "text": "Il brief dice “appuntamento tramite modulo”. Quale pulsante è coerente?",
    "options": [
      "Riparazione garantita oggi",
      "Appuntamento già confermato",
      "Richiedi un appuntamento"
    ],
    "correct": 2,
    "explanation": "Una richiesta non equivale a una conferma né a una garanzia sui tempi. Ripasso: tappa 5."
  },
  {
    "text": "Hai ottenuto una buona prima bozza. Qual è il passo successivo?",
    "options": [
      "Controllare fatti, vincoli e adeguatezza prima di usarla",
      "Pubblicarla automaticamente",
      "Aggiungere dettagli plausibili per completarla"
    ],
    "correct": 0,
    "explanation": "La revisione resta parte del lavoro, anche con un buon prompt. Ripasso: tappe 3 e 4."
  }
];
