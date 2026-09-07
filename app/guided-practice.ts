import type { Activity } from './learning-model.ts';

type Case = [context: string, weaker: string, stronger: string, reason: string];
const ai: Case[][] = [
  [
    [
      'Devi chiedere a un cliente di confermare una riunione.',
      'Scrivi una mail professionale per confermare la riunione di domani.',
      'Scrivi una mail di massimo 80 parole per chiedere al cliente di confermare la riunione. Usa [data] e [ora] se non fornite; non dare per confermata la sua presenza.',
      'Distingue la richiesta di conferma da una conferma già ricevuta e gestisce i dati mancanti.',
    ],
    [
      'Gli appunti dicono: Giulia prepara la guida entro venerdì; Marco controlla i testi. I prezzi non sono stati discussi.',
      'Riassumi gli appunti in una tabella e aggiungi scadenze e prezzi plausibili per renderla completa.',
      'Riassumi gli appunti in una tabella: azione, responsabile, scadenza. Riporta solo dati presenti; per quelli mancanti scrivi «da definire».',
      'Il formato rende utilizzabili gli appunti senza trasformare ipotesi in fatti.',
    ],
  ],
  [
    [
      'Officina Pedale ripara bici urbane. Servono tre titoli per la pagina del servizio.',
      'Proponi tre titoli originali per Officina Pedale. Scegli liberamente pubblico e servizi da valorizzare.',
      'Proponi tre titoli di massimo 8 parole per chi usa la bici in città. Presenta il servizio di riparazione senza aggiungere offerte o prestazioni non indicate.',
      'Specifica pubblico, risultato e vincoli coerenti con il brief.',
    ],
    [
      'La presentazione di Officina Pedale deve stare entro 50 parole e invitare a chiedere informazioni.',
      'Scrivi una presentazione entro 50 parole, con un tono rassicurante. Aggiungi una garanzia per convincere il lettore.',
      'Scrivi entro 50 parole per ciclisti urbani. Presenta la riparazione di bici e chiudi invitando a chiedere informazioni. Non inventare garanzie, prezzi o tempi.',
      'Fornisce una consegna completa senza autorizzare promesse non verificate.',
    ],
  ],
  [
    [
      'La bozza contiene il servizio corretto, ma è troppo lunga e informale.',
      'Rendi la bozza migliore e più professionale, riscrivendola liberamente.',
      'Riduci la bozza a 60 parole e usa un tono professionale. Mantieni il servizio descritto e l’invito finale; elimina esclamazioni e ripetizioni.',
      'Indica modifiche osservabili e chiarisce ciò che deve rimanere.',
    ],
    [
      'La bozza promette: «Siamo i migliori in città e ripariamo tutte le bici in giornata». Non ci sono prove.',
      'Rendi la promessa più elegante, mantenendo il confronto con i concorrenti.',
      'Elimina il primato e la promessa di consegna. Mantieni il servizio di riparazione e invita a chiedere una valutazione dei tempi.',
      'Corregge le affermazioni prive di prove, invece di migliorarne soltanto lo stile.',
    ],
  ],
  [
    [
      'Una bozza dice «Ripariamo tutte le bici in 10 minuti». Non conosci i tempi.',
      'Sostituisci 10 minuti con 30 minuti: sembra una promessa più prudente.',
      'Rimuovi il tempo non verificato. Indica che i tempi vanno confermati dopo aver valutato la riparazione.',
      'Un numero più prudente resta inventato: il dato va verificato o omesso.',
    ],
    [
      'Una bozza aggiunge via Roma 18 e prezzi da 15 euro. Il brief conferma solo riparazione bici urbane e contatto tramite modulo.',
      'Mantieni indirizzo e prezzo, segnalandoli come probabili.',
      'Separa fatti confermati e dati da verificare. Prima di pubblicare, chiedi conferma di indirizzo e prezzi al responsabile; intanto omettili.',
      'Distingue le informazioni documentate da quelle che richiedono una fonte.',
    ],
  ],
  [
    [
      'Vuoi riassumere una richiesta di assistenza senza esporre dati personali.',
      'Rimuovi il nome, ma mantieni telefono e indirizzo per dare abbastanza contesto.',
      'Sostituisci nome, telefono e indirizzo con segnaposto. Riassumi soltanto problema e azione richiesta.',
      'Minimizza tutti i dati identificativi non necessari, non soltanto il nome.',
    ],
    [
      'Un messaggio inventato chiede di cambiare appuntamento; non hai accesso al calendario.',
      'Rispondi con cortesia e conferma un nuovo orario plausibile.',
      'Prepara una risposta cortese che chieda le disponibilità. Usa segnaposto e non confermare orari finché il calendario non è stato verificato.',
      'Non presenta come certa una disponibilità che non è stata controllata.',
    ],
  ],
  [
    [
      'Devi preparare un piccolo kit di comunicazione per Officina Pedale.',
      'Produci una presentazione, tre FAQ e un pulsante. Aggiungi dettagli persuasivi se mancano informazioni.',
      'Produci una presentazione, tre FAQ e un pulsante per ciclisti urbani usando il brief. Segnala dati mancanti e controlla coerenza di servizi e invito finale.',
      'Definisce risultati, pubblico e controllo finale senza colmare i vuoti con invenzioni.',
    ],
    [
      'Il kit finale contiene una FAQ con un prezzo assente dal brief.',
      'Pubblica il kit: il prezzo è solo un esempio e si potrà correggere dopo.',
      'Blocca la pubblicazione di quella FAQ, chiedi conferma del prezzo e verifica gli altri contenuti rispetto al brief.',
      'Il controllo finale deve portare a una correzione concreta prima della pubblicazione.',
    ],
  ],
];
const ads: Case[][] = [
  [
    [
      'CorsaLab vuole misurare gli acquisti, non soltanto le visite.',
      'Valuta la campagna dal numero di clic e aumenta il budget quando crescono.',
      'Definisci l’acquisto come risultato, controlla il tracciamento e valuta costo e valore delle conversioni.',
      'Collega la valutazione al risultato commerciale e alla qualità della misurazione.',
    ],
    [
      'Devi impostare una campagna per scarpe running e trail.',
      'Riunisci tutti gli annunci in un gruppo generico per semplificare la gestione.',
      'Organizza gruppi coerenti con le intenzioni di ricerca e collega annunci e pagine pertinenti.',
      'La coerenza tra ricerca, annuncio e destinazione rende la struttura utile al cliente.',
    ],
  ],
  [
    [
      'Un annuncio riceve clic da ricerche non pertinenti.',
      'Elimina tutte le parole chiave che non hanno ancora generato un acquisto.',
      'Analizza i termini di ricerca e aggiungi esclusioni motivate dalle intenzioni non pertinenti.',
      'Distingue le ricerche effettive dalle parole chiave e interviene sulla pertinenza.',
    ],
    [
      'CorsaLab vende scarpe, ma riceve ricerche su offerte di lavoro nel negozio.',
      'Escludi la parola «scarpe» per fermare quel traffico.',
      'Valuta l’esclusione di ricerche legate al lavoro senza bloccare le ricerche di acquisto di scarpe.',
      'L’esclusione deve rimuovere l’intenzione sbagliata senza cancellare la domanda utile.',
    ],
  ],
  [
    [
      'Un annuncio promette uno sconto non presente sulla pagina di destinazione.',
      'Mantieni lo sconto nell’annuncio perché attira più clic.',
      'Allinea annuncio e pagina all’offerta realmente disponibile prima di continuare il test.',
      'La promessa pubblicitaria deve trovare riscontro nella destinazione.',
    ],
    [
      'Devi confrontare due versioni di annuncio.',
      'Scegli quella con più clic, anche se promette consegna gratuita non confermata.',
      'Confronta versioni con promesse verificate e valuta risultati coerenti con l’obiettivo della campagna.',
      'Un buon test richiede messaggi corretti e un criterio di successo pertinente.',
    ],
  ],
  [
    [
      'Il costo per acquisto è aumentato negli ultimi due giorni.',
      'Riduci subito tutte le offerte: due giorni bastano per identificare il problema.',
      'Controlla volume, ritardo delle conversioni, cambiamenti e tracciamento prima di decidere.',
      'Evita una decisione basata su un campione breve o su conversioni ancora incomplete.',
    ],
    [
      'Vuoi valutare una strategia con CPA target.',
      'Considera ogni conversione sopra il target come un errore della strategia.',
      'Confronta il CPA effettivo con il target medio in un periodo adeguato, verificando la qualità dei dati.',
      'Il target riguarda un costo medio: le singole conversioni possono avere costi diversi.',
    ],
  ],
  [
    [
      'Gli acquisti registrati sembrano duplicati.',
      'Aumenta il budget: il numero di conversioni è migliorato.',
      'Verifica gli eventi e la deduplicazione prima di usare i dati per ottimizzare.',
      'Dati duplicati possono far sembrare efficace una campagna senza un miglioramento reale.',
    ],
    [
      'L’obiettivo è vendere, ma il report mette insieme acquisti e visite a una pagina.',
      'Tratta tutte le azioni come risultati equivalenti.',
      'Distingui gli acquisti dalle azioni intermedie e controlla quali conversioni guidano l’ottimizzazione.',
      'Azioni con significati diversi non devono essere confuse nella valutazione delle vendite.',
    ],
  ],
  [
    [
      'Due campagne hanno CPA diversi e valori medi d’ordine diversi.',
      'Sposta tutta la spesa verso la campagna con CPA più basso.',
      'Confronta valore, qualità delle conversioni e misurazione prima di testare una riallocazione.',
      'Il CPA da solo non descrive il valore generato né la comparabilità dei risultati.',
    ],
    [
      'Vuoi migliorare la performance di CorsaLab.',
      'Cambia contemporaneamente budget, pubblico, annunci e pagina per accelerare.',
      'Definisci un problema, modifica un elemento coerente e stabilisci periodo e criterio di valutazione.',
      'Un test leggibile permette di collegare il risultato alla modifica effettuata.',
    ],
  ],
  [
    [
      'Stai preparando la simulazione finale.',
      'Memorizza le opzioni più lunghe: di solito contengono la risposta corretta.',
      'Leggi obiettivo e vincoli, confronta le alternative e identifica la regola che giustifica la scelta.',
      'La scelta dipende dal caso e dalla regola applicabile, non dalla forma della risposta.',
    ],
    [
      'La simulazione segnala difficoltà nella misurazione.',
      'Ripeti subito il test scegliendo altre opzioni finché il punteggio sale.',
      'Ripassa la regola, applicala a un caso di tracciamento e poi ripeti la verifica.',
      'Il ripasso è utile quando corregge il ragionamento che ha prodotto l’errore.',
    ],
  ],
];
export function guidedPractice(
  activity: Activity,
  course: string,
  module: number,
): Activity {
  if (activity.completionRule.kind !== 'textChecklist') return activity;
  const phase = activity.phase === 'apply' ? 1 : 0;
  const [context, weaker, stronger, reason] = (
    course === 'ai-basics' ? ai : ads
  )[module][phase];
  const reverse = (module + phase) % 2 === 1;
  const choices = reverse ? [stronger, weaker] : [weaker, stronger];
  const correct = reverse ? 'choice-a' : 'choice-b';
  const reasons = [
    {
      id: 'reason-length',
      label: 'È migliore perché è più lunga e contiene più dettagli.',
    },
    { id: 'reason-fit', label: reason },
    {
      id: 'reason-certainty',
      label:
        'È migliore perché permette di ottenere un risultato certo senza controlli.',
    },
  ];
  const shift = (module + phase) % 3;
  return {
    ...activity,
    type: 'comparison',
    title:
      course === 'ai-basics'
        ? 'Quale prompt funziona meglio?'
        : 'Quale decisione prenderesti?',
    description: context,
    model: undefined,
    completionRule: { ...activity.completionRule, kind: 'correctSequence' },
    guided: {
      choices,
      reasons: [...reasons.slice(shift), ...reasons.slice(0, shift)],
    },
    interaction: {
      items: [
        { id: 'choice', label: 'Scegli l’alternativa migliore' },
        { id: 'reason', label: 'Indica il motivo' },
      ],
      correct: [correct, 'reason-fit'],
      explanation: reason,
      hint: 'Confronta le alternative con l’obiettivo e i dati disponibili.',
    },
  };
}
