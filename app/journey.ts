export const levels = [
  {
    "title": "Primo contatto",
    "tag": "ESPLORATORE",
    "goal": "Scopri che cosa puoi chiedere a un’AI.",
    "slides": [
      {
        "title": "AI: partiamo dalle parole",
        "steps": [
          "AI significa intelligenza artificiale. È un nome che raccoglie diversi tipi di sistemi informatici.",
          "Qui useremo l’AI generativa: produce contenuti, per esempio un testo, a partire da una richiesta.",
          "Puoi chiederle una bozza, una spiegazione o delle idee. Sei tu a decidere se il risultato è utile."
        ],
        "takeaway": "Tu dai la direzione. L’AI propone."
      },
      {
        "title": "Una conversazione, tre passaggi",
        "steps": [
          "1. Scrivi una richiesta. Il messaggio che invii si chiama prompt.",
          "2. Leggi la risposta. È un risultato da esaminare, non una garanzia di verità.",
          "3. Chiedi una modifica. Puoi dire che cosa tenere e che cosa migliorare."
        ],
        "takeaway": "Richiesta → risposta → revisione"
      },
      {
        "title": "Una bella risposta può sbagliare",
        "steps": [
          "Il sistema ha appreso regolarità da molti esempi e genera testo in base al contesto.",
          "Può costruire una frase credibile anche quando un fatto è sbagliato o manca un’informazione.",
          "Inizia da compiti che puoi controllare: riscrivere un messaggio, organizzare un elenco, proporre titoli."
        ],
        "takeaway": "Chiaro e convincente non significa verificato."
      }
    ],
    "challenges": [
      {
        "goal": "Vuoi partire da un compito facile da controllare. Quale prompt scegli?",
        "options": [
          "Dimmi con certezza quanto costa oggi ogni bici in vendita nella mia città.",
          "Riscrivi più chiaramente questo messaggio: «Vorrei fissare un appuntamento per la bici»."
        ],
        "correct": 1,
        "why": "B fornisce il testo da trasformare: puoi confrontare prima e dopo. A chiede molti dati aggiornati senza fornire fonti; una risposta non sarebbe una garanzia.",
        "hint": "Scegli il compito per cui hai già un riferimento."
      },
      {
        "goal": "Vuoi capire una parola nuova, senza conoscenze tecniche.",
        "options": [
          "Spiega “prompt” a un principiante e fai un esempio di una richiesta quotidiana.",
          "Spiega “prompt” usando termini specialistici, senza esempi o definizioni."
        ],
        "correct": 0,
        "why": "A adatta la spiegazione al tuo livello. B potrebbe servire a un esperto, ma non al principiante descritto nella consegna.",
        "hint": "Il prompt deve essere adatto a chi leggerà."
      },
      {
        "goal": "Vuoi ottenere idee da valutare, senza promesse impossibili.",
        "options": [
          "Dammi il titolo che farà sicuramente comprare il mio prodotto a tutti.",
          "Proponi tre titoli per una pagina di riparazione bici; li confronterò prima di sceglierne uno."
        ],
        "correct": 1,
        "why": "B chiede alternative da valutare. A pretende un risultato commerciale che il titolo da solo non può garantire.",
        "hint": "Idee da confrontare o certezza impossibile?"
      }
    ],
    "lab": "Prenditi 4 minuti. Immagina un’attività quotidiana in cui vorresti aiuto: riscrivere un messaggio, capire una parola o mettere in ordine delle idee. Scrivi una richiesta e spiega come controlleresti il risultato.",
    "model": "“Riscrivi in modo cordiale questo messaggio, senza cambiare il senso: Vorrei spostare l’appuntamento da martedì a giovedì. Chiedi se è possibile.” Controllo che i due giorni siano corretti e che il testo chieda disponibilità, senza dare lo spostamento per confermato.",
    "criteria": [
      "Ho indicato un compito concreto.",
      "Ho fornito il materiale o il contesto necessario.",
      "Ho scritto come controllerò il risultato."
    ]
  },
  {
    "title": "Una richiesta chiara",
    "tag": "APPRENDISTA",
    "goal": "Dai all’AI una consegna facile da capire.",
    "slides": [
      {
        "title": "Il prompt è una consegna",
        "steps": [
          "“Fammi qualcosa di bello” lascia aperte troppe decisioni. Bello per chi? Per fare cosa?",
          "Un obiettivo preciso rende la risposta più facile da valutare. Per esempio: scrivi tre titoli per un negozio di bici.",
          "Non serve usare parole complicate. Scrivi come parleresti a una persona che non conosce il tuo progetto."
        ],
        "takeaway": "Prima il compito. Poi i dettagli utili."
      },
      {
        "title": "Quattro ingredienti",
        "steps": [
          "Obiettivo: che cosa deve fare? Contesto: per chi, e con quali informazioni?",
          "Vincoli: che cosa deve rispettare o evitare? Formato: come deve presentare il risultato?",
          "Esempio: tre titoli, per ciclisti urbani, entro otto parole ciascuno, in un elenco."
        ],
        "takeaway": "Obiettivo · contesto · vincoli · formato"
      },
      {
        "title": "Conosci Officina Pedale",
        "steps": [
          "Da ora lavoriamo su un’attività inventata: Officina Pedale. Ripara bici urbane, cura i freni e sostituisce camere d’aria.",
          "Riceve su appuntamento tramite modulo di contatto. Non conosciamo prezzi, indirizzo, orari o tempi di riparazione.",
          "Questi sono i fatti disponibili. Puoi usarli per scrivere, ma non riempire i vuoti con promesse."
        ],
        "takeaway": "I fatti disponibili sono il tuo punto di partenza."
      }
    ],
    "challenges": [
      {
        "goal": "Servono esattamente tre titoli brevi. Quale richiesta è più controllabile?",
        "options": [
          "Scrivi tre titoli per Officina Pedale, massimo otto parole ciascuno, in elenco.",
          "Scrivi alcuni bei titoli per Officina Pedale, con una lunghezza abbastanza breve."
        ],
        "correct": 0,
        "why": "A indica numero, limite e formato. B è comprensibile, ma “alcuni” e “abbastanza breve” lasciano criteri indefiniti.",
        "hint": "Cerca quantità e limiti verificabili."
      },
      {
        "goal": "Il testo è destinato a persone che usano la bici in città.",
        "options": [
          "Spiega la manutenzione dei freni a tecnici specializzati, usando sigle non spiegate.",
          "Spiega la manutenzione dei freni a ciclisti urbani, con parole comuni e sigle spiegate."
        ],
        "correct": 1,
        "why": "B rispetta il pubblico. A non è un prompt sbagliato in assoluto: è adatto a un pubblico diverso.",
        "hint": "Non scegliere soltanto in base alla lunghezza."
      },
      {
        "goal": "Manca il listino. Devi scrivere una presentazione corretta.",
        "options": [
          "Usa i servizi forniti e segnala i prezzi come dato da chiedere al titolare.",
          "Usa i servizi forniti e aggiungi prezzi plausibili per rendere il testo completo."
        ],
        "correct": 0,
        "why": "A separa dati noti e mancanti. B può trasformare un’ipotesi in un’offerta commerciale non approvata.",
        "hint": "Un vuoto va segnalato, non mascherato."
      }
    ],
    "lab": "Dedica 4 minuti a scrivere il prompt per la presentazione di Officina Pedale. Inserisci i quattro ingredienti. Usa il brief nelle slide e poni un limite di 50 parole. Non generare ancora il testo: progetta una consegna precisa.",
    "model": "“Scrivi una presentazione di massimo 50 parole per Officina Pedale, rivolta a ciclisti urbani. Usa solo questi fatti: ripara bici urbane, cura i freni, sostituisce camere d’aria e riceve su appuntamento tramite modulo. Tono semplice. Restituisci un paragrafo; segnala separatamente i dati mancanti senza inventarli.”",
    "criteria": [
      "Sono presenti obiettivo e pubblico.",
      "Ho incluso fatti, vincoli e formato.",
      "Ho vietato l’invenzione dei dati mancanti."
    ]
  },
  {
    "title": "La seconda versione",
    "tag": "COSTRUTTORE",
    "goal": "Impara a correggere una risposta con precisione.",
    "slides": [
      {
        "title": "La prima bozza è l’inizio",
        "steps": [
          "Una risposta può essere troppo lunga, troppo generica oppure contenere un’informazione non fornita.",
          "Prima di riscrivere la richiesta, identifica il problema. Che cosa deve cambiare? Che cosa vuoi conservare?",
          "Dare un feedback significa indicare la modifica, non limitarsi a dire “non mi piace”."
        ],
        "takeaway": "Osserva → indica → correggi"
      },
      {
        "title": "Proviamo con una bozza",
        "steps": [
          "Esempio simulato: “Officina Pedale ripara qualsiasi bici in 24 ore. Vieni senza appuntamento!”",
          "Il brief parla solo di bici urbane e non indica tempi. Dice inoltre che occorre richiedere un appuntamento.",
          "Feedback: limita il testo alle bici urbane, elimina le 24 ore e invita a richiedere un appuntamento tramite modulo."
        ],
        "takeaway": "Correggi i fatti prima di abbellire."
      },
      {
        "title": "Mantieni i vincoli importanti",
        "steps": [
          "Nella conversazione puoi chiedere di modificare la bozza precedente. Ripeti i fatti e i limiti fondamentali quando serve.",
          "Se cambi attività o pubblico, riparti con una richiesta che contenga il nuovo contesto.",
          "Non cercare infinite versioni: fermati quando il testo rispetta i criteri e hai controllato i fatti."
        ],
        "takeaway": "Una revisione ha un obiettivo preciso."
      }
    ],
    "challenges": [
      {
        "goal": "La bozza è lunga e piena di slogan.",
        "options": [
          "Rendila più bella, interessante e professionale.",
          "Riduci a 40 parole, elimina gli slogan e mantieni i servizi elencati."
        ],
        "correct": 1,
        "why": "B traduce il problema in modifiche verificabili. A esprime un gusto ma non chiarisce come intervenire.",
        "hint": "Individua un’istruzione che potresti controllare."
      },
      {
        "goal": "La bozza promette “riparazioni in 24 ore”, dato non disponibile.",
        "options": [
          "Elimina il riferimento alle 24 ore: nel brief non ci sono tempi di riparazione.",
          "Scrivi “riparazioni velocissime”: così non compare più il numero 24."
        ],
        "correct": 0,
        "why": "A elimina la promessa non supportata. B la sostituisce con un’altra promessa, ancora priva di conferma.",
        "hint": "Togliere il numero non risolve sempre il problema."
      },
      {
        "goal": "Hai cambiato cliente: ora scrivi per una biblioteca.",
        "options": [
          "Continua con tutti i dettagli della precedente officina.",
          "Usa questo nuovo brief della biblioteca e sostituisci il contesto precedente."
        ],
        "correct": 1,
        "why": "B rende esplicito il cambio di contesto. A rischia di mescolare servizi e pubblico di due attività diverse.",
        "hint": "Il modello deve conoscere il nuovo compito."
      }
    ],
    "lab": "In 4 minuti correggi questa bozza simulata: “Officina Pedale, la migliore in città, ripara tutte le bici in giornata. Passa quando vuoi!”. Scrivi prima il feedback e poi una tua versione corretta. Non serve un servizio AI esterno.",
    "model": "Feedback: “Elimina il primato e la promessa in giornata. Limita i servizi alle bici urbane e correggi l’accesso su appuntamento tramite modulo.” Versione: “Officina Pedale ripara bici urbane, esegue manutenzione dei freni e sostituisce camere d’aria. Richiedi un appuntamento tramite il modulo di contatto.”",
    "criteria": [
      "Ho eliminato le promesse senza supporto.",
      "Ho corretto i servizi e l’accesso su appuntamento.",
      "Ho scritto sia il feedback sia la versione rivista."
    ]
  },
  {
    "title": "Occhio agli errori",
    "tag": "INVESTIGATORE",
    "goal": "Distingui ciò che sai da ciò che va verificato.",
    "slides": [
      {
        "title": "Credibile non basta",
        "steps": [
          "Un’AI può inventare fatti, nomi, numeri o fonti. Si usa spesso il termine “allucinazione” per questi contenuti falsi o non supportati.",
          "Il tono sicuro non rivela se un’informazione è corretta. Una frase scorrevole può contenere un indirizzo inventato.",
          "Cerchia i fatti: nomi, numeri, date, servizi e promesse. Poi chiediti da dove arrivano."
        ],
        "takeaway": "Per ogni fatto, cerca un riscontro."
      },
      {
        "title": "Verifica fuori dalla risposta",
        "steps": [
          "Chiedere “sei sicuro?” può ottenere una correzione, ma non è un controllo indipendente.",
          "Se una risposta cita una fonte, aprila: deve esistere e sostenere proprio l’affermazione che stai usando.",
          "Per il nostro caso, prezzi e orari vanno confermati dal titolare o da documenti approvati. Finché mancano, omettili."
        ],
        "takeaway": "Una fonte citata va anche controllata."
      },
      {
        "title": "Tre domande prima di usare",
        "steps": [
          "È fedele? Confronta la risposta con il brief e le fonti.",
          "È adatta? Controlla il pubblico, il tono e le informazioni davvero necessarie.",
          "È utilizzabile? Verifica limiti, chiarezza e azioni: richiedere un appuntamento non equivale a confermarlo."
        ],
        "takeaway": "Fedele · adatto · utilizzabile"
      }
    ],
    "challenges": [
      {
        "goal": "Devi controllare una descrizione usando il brief originale.",
        "options": [
          "Confronta descrizione e brief; elenca separatamente tutte le affermazioni non supportate.",
          "Leggi la descrizione e conferma che è corretta, purché sembri realistica."
        ],
        "correct": 0,
        "why": "A imposta un confronto utile, da rivedere comunque. B usa la plausibilità al posto delle prove.",
        "hint": "Qual è il riferimento con cui confrontare?"
      },
      {
        "goal": "Non sai se l’indirizzo proposto sia vero.",
        "options": [
          "Conferma l’indirizzo se lo hai scritto anche nella risposta precedente.",
          "Segnala l’indirizzo come non verificato; lo controllerò con il titolare prima di usarlo."
        ],
        "correct": 1,
        "why": "B mantiene visibile l’incertezza e prevede un riscontro. Ripetere un dato, come in A, non lo rende vero.",
        "hint": "Ripetizione e verifica sono cose diverse."
      },
      {
        "goal": "Il cliente riceve richieste tramite modulo, poi conferma l’appuntamento.",
        "options": [
          "Scrivi un pulsante per richiedere l’appuntamento, senza presentarlo come già confermato.",
          "Scrivi un pulsante che dica appuntamento confermato appena si apre il modulo."
        ],
        "correct": 0,
        "why": "A descrive l’azione disponibile. B promette una conferma che non è avvenuta.",
        "hint": "Che cosa accade davvero quando premi il pulsante?"
      }
    ],
    "lab": "In 4 minuti esamina questa bozza: “Officina Pedale è in via Roma 18, ripara bici urbane a partire da 15 euro e riceve su appuntamento tramite modulo”. Dividi i fatti in confermati e da verificare. Per questi ultimi indica come faresti la verifica.",
    "model": "Confermati: riparazione bici urbane, appuntamento tramite modulo. Da verificare: via Roma 18 e prezzo da 15 euro. Chiederei indirizzo e listino approvati al titolare. Nel frattempo eliminerei i due dettagli dalla bozza.",
    "criteria": [
      "Ho separato fatti noti e dati mancanti.",
      "Ho indicato una verifica indipendente.",
      "Non ho sostituito i dati mancanti con ipotesi."
    ]
  },
  {
    "title": "Dati sotto controllo",
    "tag": "CUSTODE",
    "goal": "Usa solo le informazioni che servono.",
    "slides": [
      {
        "title": "Meno dati, stessa esercitazione",
        "steps": [
          "Per imparare puoi usare nomi e situazioni inventati, come Officina Pedale. Non occorrono dati di clienti reali.",
          "Non inserire password o credenziali in una richiesta. Per una bozza, spesso bastano dettagli generici.",
          "Prima di condividere dati reali, controlla le regole del servizio e quelle della tua organizzazione."
        ],
        "takeaway": "Usa il minimo necessario."
      },
      {
        "title": "Togliere un nome può non bastare",
        "steps": [
          "Un testo può identificare qualcuno anche senza il nome: indirizzo, numero ordine e dettagli insoliti possono bastare.",
          "Per esercitarti, ricrea il tipo di problema con un messaggio completamente inventato.",
          "Esempio: “Un cliente vorrebbe spostare un appuntamento”. Il recapito personale non ti aiuta a imparare a rispondere."
        ],
        "takeaway": "Conserva il problema, non i dati personali."
      },
      {
        "title": "Pratica gratuita, qui dentro",
        "steps": [
          "Le sfide di questo corso sono esempi preparati: non contattano un modello AI e non richiedono abbonamenti.",
          "Il quaderno ti permette di costruire e revisionare il prompt. I criteri sono per l’autovalutazione: il testo non viene giudicato da un’AI.",
          "L’audio legge il testo delle slide con una voce del browser. Puoi sempre continuare leggendo."
        ],
        "takeaway": "Per imparare il metodo bastano gli esempi."
      }
    ],
    "challenges": [
      {
        "goal": "Vuoi esercitarti a rispondere a una richiesta di appuntamento.",
        "options": [
          "Scrivi una risposta a questo caso inventato: un cliente chiede di spostare l’appuntamento.",
          "Scrivi una risposta usando l’intera rubrica clienti, incluse note e recapiti personali."
        ],
        "correct": 0,
        "why": "A contiene il necessario per l’esercizio. B aggiunge dati personali che non servono a imparare la risposta.",
        "hint": "Quali dati servono davvero al compito?"
      },
      {
        "goal": "Devi spiegare a un collega dove inserire una password.",
        "options": [
          "Usa la mia password reale come esempio nel testo della guida.",
          "Usa il segnaposto [PASSWORD] nel testo della guida, senza credenziali reali."
        ],
        "correct": 1,
        "why": "B spiega la procedura senza esporre una credenziale. A introduce un segreto che non serve alla spiegazione.",
        "hint": "Un segnaposto è sufficiente?"
      },
      {
        "goal": "Vuoi creare un esempio partendo da un reclamo reale.",
        "options": [
          "Togli soltanto il nome; conserva indirizzo e numero ordine.",
          "Crea un caso fittizio con lo stesso tipo di problema, senza dettagli identificativi."
        ],
        "correct": 1,
        "why": "B permette di esercitarsi sulla situazione. A lascia informazioni che potrebbero identificare la persona.",
        "hint": "Eliminare il nome non garantisce anonimato."
      }
    ],
    "lab": "In 4 minuti inventa un messaggio di un cliente che vuole cambiare appuntamento. Non inserire nomi veri o recapiti. Scrivi il prompt per una risposta cortese che chieda disponibilità e non inventi la conferma.",
    "model": "“Caso inventato: un cliente vorrebbe spostare l’appuntamento a giovedì. Scrivi una risposta cordiale entro 40 parole: comunica che la disponibilità deve essere verificata, senza confermare lo spostamento. Non aggiungere orari o recapiti.”",
    "criteria": [
      "Il caso è completamente inventato.",
      "Ho incluso solo i dettagli utili.",
      "Non ho promesso una disponibilità non verificata."
    ]
  },
  {
    "title": "Missione finale",
    "tag": "PILOTA DI PROMPT",
    "goal": "Metti insieme tutto quello che hai imparato.",
    "slides": [
      {
        "title": "Un mini-progetto, un metodo",
        "steps": [
          "Prepara i contenuti per la pagina di Officina Pedale: una breve presentazione, tre domande frequenti e un pulsante.",
          "Usa solo il brief: bici urbane, freni, camere d’aria, appuntamento tramite modulo. Non ci sono prezzi o tempi.",
          "L’obiettivo è un kit di testi. Un testo per un pulsante non crea da solo un sito o una prenotazione."
        ],
        "takeaway": "Dal brief a un risultato controllato."
      },
      {
        "title": "La tua checklist di partenza",
        "steps": [
          "Scrivi il compito, il pubblico e i fatti. Scegli il formato: presentazione, tre domande con risposte e pulsante.",
          "Indica i limiti: 50 parole per la presentazione e cinque per il pulsante. Chiedi di segnalare i dati mancanti.",
          "Rivedi i testi usando i criteri appresi. Puoi scriverli tu nel laboratorio: non serve aprire altri strumenti."
        ],
        "takeaway": "Progetta → scrivi → rivedi → verifica"
      },
      {
        "title": "I punti raccontano il percorso",
        "steps": [
          "Ogni confronto risolto vale 20 punti, anche dopo un errore. Ogni laboratorio completato vale 40 punti.",
          "Puoi sbagliare e riprovare senza perdere vite. Rivedere la stessa attività non aggiunge punti: conta quello che hai completato.",
          "I sei livelli valgono 600 punti complessivi. È un traguardo didattico, non una certificazione professionale."
        ],
        "takeaway": "L’obiettivo è capire perché."
      }
    ],
    "challenges": [
      {
        "goal": "Vuoi ottenere il kit con formati chiari.",
        "options": [
          "Scrivi qualcosa per il sito, scegli tu tutto il resto.",
          "Usa il brief: presentazione entro 50 parole, tre FAQ e un pulsante entro cinque parole."
        ],
        "correct": 1,
        "why": "B definisce i risultati attesi. A delega anche decisioni che ti servono per valutare il lavoro.",
        "hint": "Sai dire quando la consegna è completa?"
      },
      {
        "goal": "Nelle FAQ manca il prezzo della manutenzione.",
        "options": [
          "Evita di indicare un prezzo; elencalo tra i dati da ottenere dal titolare.",
          "Aggiungi un prezzo realistico: il titolare potrà correggerlo se se ne accorge."
        ],
        "correct": 0,
        "why": "A mantiene separati fatti e lacune. B crea un’informazione commerciale non confermata.",
        "hint": "Il dato non può diventare vero per comodità."
      },
      {
        "goal": "Hai ricevuto il kit. Quale richiesta prepara un controllo utile?",
        "options": [
          "Dichiara che tutto è pronto per essere pubblicato, senza ulteriori revisioni.",
          "Confronta il kit con il brief ed evidenzia aggiunte e limiti non rispettati; poi controllerò anch’io."
        ],
        "correct": 1,
        "why": "B aiuta a organizzare la revisione e mantiene il controllo umano. A salta la verifica.",
        "hint": "L’ultimo passaggio resta il controllo."
      }
    ],
    "lab": "Dedica almeno 4 minuti al tuo kit. Scrivi il prompt, poi una presentazione, tre domande frequenti con risposta e un pulsante per Officina Pedale. Puoi scriverli tu. Confronta tutto con il brief e annota una correzione fatta. Se ti serve più tempo, prosegui al tuo ritmo.",
    "model": "Prompt: “Con i soli fatti del brief, crea una presentazione entro 50 parole, tre FAQ e un pulsante entro cinque parole per ciclisti urbani. Segnala i dati mancanti”.\nPresentazione: “Officina Pedale ripara bici urbane, cura i freni e sostituisce camere d’aria. Richiedi un appuntamento tramite il modulo di contatto.”\nFAQ: “Quali bici trattate?” — “Bici urbane”. “Quali servizi offrite?” — “Riparazioni, manutenzione freni e sostituzione camere d’aria”. “Come richiedo un appuntamento?” — “Tramite modulo di contatto”.\nPulsante: “Richiedi un appuntamento”.\nRevisione: ho eliminato un prezzo non presente nel brief.",
    "criteria": [
      "Ho incluso prompt, presentazione, tre FAQ e pulsante.",
      "Ho controllato i limiti e tutti i fatti rispetto al brief.",
      "Ho annotato una revisione, senza promesse inventate."
    ]
  }
];
