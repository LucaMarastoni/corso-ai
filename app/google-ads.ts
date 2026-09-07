import { presentLessonSlide } from './lesson-content.ts';
import { PHASES, type Activity } from './learning-model.ts';
import { XP_REWARDS } from './learning-config.ts';
import type { Course, CourseModule, ExamQuestion } from './course-types.ts';
import type { Achievement } from './achievements.ts';
const sources = [
  {
    title: 'Ranking dell’annuncio e asta',
    url: 'https://support.google.com/google-ads/answer/1722122?hl=it',
  },
  {
    title: 'Punteggio di qualità: strumento diagnostico',
    url: 'https://support.google.com/google-ads/answer/6167118?hl=it',
  },
  {
    title: 'Corrispondenza delle parole chiave',
    url: 'https://support.google.com/google-ads/answer/7478529?hl=it',
  },
  {
    title: 'Targeting e osservazione',
    url: 'https://support.google.com/google-ads/answer/7365594?hl=en',
  },
  {
    title: 'Scelta della strategia di offerta',
    url: 'https://support.google.com/google-ads/answer/6167148?hl=it',
  },
  {
    title: 'Interpretazione delle conversioni',
    url: 'https://support.google.com/google-ads/answer/6270625?hl=en',
  },
  {
    title: 'Configurare la misurazione',
    url: 'https://support.google.com/google-ads/answer/1722022?hl=en',
  },
  {
    title: 'Ottimizzare con i dati',
    url: 'https://support.google.com/google-ads/answer/9451527?hl=en',
  },
  {
    title: 'Struttura dell’account',
    url: 'https://support.google.com/google-ads/answer/1704396?hl=en',
  },
  {
    title: 'Budget giornaliero medio',
    url: 'https://support.google.com/google-ads/answer/6385083?hl=en',
  },
  {
    title: 'Certificazioni ufficiali su Skillshop',
    url: 'https://support.google.com/google-ads/answer/9702955?hl=en',
  },
];
type Lesson = { title: string; steps: string[]; takeaway: string };
type Question = {
  goal: string;
  options: string[];
  correct: number;
  why: string;
  hint: string;
};
const lesson = (title: string, steps: string[], takeaway: string): Lesson => ({
  title,
  steps,
  takeaway,
});
const q = (
  goal: string,
  options: string[],
  correct: number,
  why: string,
): Question => ({
  goal,
  options,
  correct,
  why,
  hint: 'Rileggi obiettivo, vincoli e qualità dei dati prima di scegliere.',
});
const content = [
  {
    title: 'Fondamenti di Google Ads',
    description:
      'Collega obiettivi, struttura dell’account e funzionamento dell’asta.',
    lessons: [
      lesson(
        'Un obiettivo prima della campagna',
        [
          'Search intercetta ricerche; Display e Video possono raggiungere persone in altri momenti del percorso.',
          'Una campagna per contatti va valutata su contatti utili, non soltanto sul traffico.',
          'Nel nostro caso fittizio, CorsaLab vende scarpe running online: la vendita misurata è un risultato più utile del semplice clic.',
        ],
        'Parti dal risultato aziendale che vuoi misurare.',
      ),
      lesson(
        'Account → campagne → gruppi',
        [
          'L’account raccoglie le impostazioni generali e la fatturazione.',
          'Le campagne organizzano budget e impostazioni di distribuzione. I gruppi di annunci riuniscono messaggi e targeting correlati.',
          'In Search, raggruppa keyword e annunci per un intento coerente; evita un unico gruppo con prodotti senza relazione.',
        ],
        'Una struttura leggibile rende più semplici le decisioni.',
      ),
      lesson(
        'Come funziona l’asta?',
        [
          'Un’asta determina se e dove può apparire un annuncio idoneo.',
          'Ad Rank considera offerta, qualità, soglie, concorrenza, contesto e impatto previsto degli asset.',
          'L’offerta più alta non garantisce la posizione migliore: pertinenza e utilità dell’esperienza contano.',
        ],
        'Pagare di più non significa vincere automaticamente.',
      ),
    ],
    practice:
      'CorsaLab vuole vendite online, non solo visite. Scrivi un obiettivo misurabile e proponi due gruppi di annunci Search con intenti distinti.',
    checklist: [
      'Ho scelto un risultato aziendale misurabile.',
      'Ho distinto i gruppi per intento o prodotto.',
    ],
    apply:
      'Hai 3 linee di prodotto: running strada, trail e accessori. Proponi una struttura iniziale di campagne e gruppi, giustifica il livello a cui gestire il budget e indica la conversione principale.',
    questions: [
      q(
        'Quale risultato è più coerente con l’obiettivo vendite di CorsaLab?',
        [
          'Più impression a qualsiasi costo',
          'Acquisti tracciati con valore',
          'Più keyword nell’account',
        ],
        1,
        'Un acquisto con valore collega la campagna al risultato commerciale. Impression e ampiezza dell’account non dimostrano vendite.',
      ),
      q(
        'Due annunci sono idonei. Chi offre di più appare necessariamente prima?',
        [
          'Sì, conta solo l’offerta',
          'No, Ad Rank considera anche qualità e altri segnali',
        ],
        1,
        'Ad Rank non è una graduatoria di sole offerte: il contesto e la qualità possono cambiare l’esito dell’asta.',
      ),
      q(
        'Dove organizzeresti keyword e annunci per lo stesso intento Search?',
        [
          'In un gruppo di annunci coerente',
          'Nella sezione fatturazione',
          'In una conversione secondaria',
        ],
        0,
        'Il gruppo collega annunci e targeting correlati; fatturazione e conversioni hanno altre responsabilità.',
      ),
    ],
  },
  {
    title: 'Search Campaigns',
    description:
      'Scegli keyword, corrispondenze e messaggi che rispondono all’intento.',
    lessons: [
      lesson(
        'Leggi l’intento, non solo la parola',
        [
          '“Scarpe” è una ricerca ampia e ambigua.',
          '“Comprare scarpe running uomo online” esprime un intento commerciale più esplicito.',
          'Una keyword specifica può essere utile, ma non garantisce traffico o conversioni: controlla termini di ricerca e risultati.',
        ],
        'La richiesta della persona guida il messaggio.',
      ),
      lesson(
        'Tre corrispondenze, significati diversi',
        [
          'Generica può coprire ricerche correlate; a frase considera il significato della keyword.',
          'Esatta copre ricerche con lo stesso significato o intento: non è una corrispondenza solo letterale.',
          'Le parole chiave escluse aiutano a filtrare intenti non utili; verifica le ricerche reali prima di aggiungerle indiscriminatamente.',
        ],
        'La corrispondenza non elimina il bisogno di controllo.',
      ),
      lesson(
        'Qualità e Ad Rank non sono la stessa metrica',
        [
          'Quality Score è una diagnosi da 1 a 10 a livello keyword.',
          'Le sue componenti comprendono CTR previsto, pertinenza dell’annuncio ed esperienza sulla pagina di destinazione.',
          'Il numero Quality Score non entra direttamente nell’asta. Ad Rank usa valutazioni e segnali dell’asta.',
        ],
        'Usa Quality Score per diagnosticare, non come formula del ranking.',
      ),
    ],
    practice:
      'Scrivi due keyword per scarpe trail con intento d’acquisto e una ricerca da escludere perché riguarda un tutorial fai-da-te.',
    checklist: [
      'Ho distinto l’intento commerciale da quello informativo.',
      'Ho motivato l’esclusione senza bloccare acquisti pertinenti.',
    ],
    apply:
      'La keyword riguarda scarpe trail, ma l’annuncio parla di sandali e apre la homepage. Scrivi un annuncio più pertinente e descrivi la pagina di destinazione; spiega quale componente diagnostica controlleresti.',
    questions: [
      q(
        'Quale ricerca esprime più chiaramente un intento di acquisto?',
        ['Scarpe', 'Comprare scarpe running uomo online'],
        1,
        'La seconda indica azione, prodotto e canale. Non garantisce una conversione, ma rende l’intento più esplicito.',
      ),
      q(
        'La corrispondenza esatta richiede sempre gli stessi caratteri digitati?',
        [
          'Sì, è un confronto letterale',
          'No, può coprire lo stesso significato o intento',
        ],
        1,
        'Esatta non equivale a stringa identica: Google considera significato e intento della ricerca.',
      ),
      q(
        'Come useresti un Quality Score basso?',
        [
          'Come diagnosi di pertinenza, CTR previsto e landing page',
          'Come formula numerica diretta di Ad Rank',
          'Come prova certa di tracciamento rotto',
        ],
        0,
        'È uno strumento diagnostico della qualità; da solo non descrive né la formula d’asta né lo stato del tracking.',
      ),
    ],
  },
  {
    title: 'Targeting & Audience',
    description: 'Distingui restrizioni, osservazione e segnali di pubblico.',
    lessons: [
      lesson(
        'Targeting oppure osservazione?',
        [
          'Targeting può limitare la copertura ai criteri scelti.',
          'Osservazione permette di analizzare segmenti senza restringere ulteriormente la copertura.',
          'In una campagna Search, osservare un segmento è diverso dal raggiungere soltanto quel segmento.',
        ],
        'Leggere un segmento non significa limitare la campagna.',
      ),
      lesson(
        'Dati propri e ritorno degli utenti',
        [
          'I segmenti di dati propri possono rappresentare persone che hanno già interagito con l’attività.',
          'Un visitatore di una pagina prodotto e un acquirente recente possono richiedere messaggi diversi.',
          'Il riutilizzo dei dati richiede impostazioni e requisiti applicabili: non caricare elenchi personali senza verificarne l’idoneità.',
        ],
        'Un’esperienza precedente dà contesto, non certezza di acquisto.',
      ),
      lesson(
        'Un segmento non racconta tutto',
        [
          'Età e altri criteri demografici non spiegano da soli il bisogno della persona.',
          'Leggi performance, volume dei dati e intento prima di escludere un gruppo.',
          'Con Smart Bidding, i segmenti proprietari in osservazione possono essere segnali; non trattarli come regole rigide di offerta.',
        ],
        'Evita conclusioni forti da campioni deboli.',
      ),
    ],
    practice:
      'Vuoi confrontare clienti nuovi e visitatori precedenti senza limitare la Search. Indica l’impostazione da usare e il dato che confronteresti.',
    checklist: [
      'Non ho confuso osservazione e restrizione.',
      'Ho scelto una metrica collegata all’obiettivo.',
    ],
    apply:
      'CorsaLab ha molti visitatori prodotto ma pochi acquisti. Proponi due segmenti e un messaggio per ciascuno, indica cosa osservare e quali dati o requisiti controllare prima di attivare una campagna.',
    questions: [
      q(
        'Vuoi analizzare un pubblico senza ridurre la copertura Search. Cosa scegli?',
        ['Targeting esclusivo', 'Osservazione'],
        1,
        'Osservazione aggiunge lettura dei segmenti senza restringere il targeting esistente.',
      ),
      q(
        'Un segmento ha due clic e zero vendite. Lo escludi subito?',
        [
          'Sì, zero vendite è una prova sufficiente',
          'No, verifico volume, misurazione e contesto',
        ],
        1,
        'Due clic offrono troppo poca evidenza. Una decisione richiede dati e contesto, non una percentuale isolata.',
      ),
      q(
        'Quale coppia separa due esperienze realmente diverse?',
        [
          'Visitatori prodotto e acquirenti recenti',
          'Utenti con nomi corti e lunghi',
        ],
        0,
        'Le interazioni con il prodotto descrivono momenti diversi del percorso; la lunghezza del nome non informa la strategia.',
      ),
    ],
  },
  {
    title: 'Budget & Bidding',
    description:
      'Collega spesa, conversioni e valore alla strategia di offerta.',
    lessons: [
      lesson(
        'Budget e offerta fanno due lavori',
        [
          'Il budget pianifica la spesa; la strategia di offerta governa come partecipare alle aste.',
          'CPC riguarda il costo per clic, CPA il costo per acquisizione o conversione definita.',
          'Una spesa giornaliera può oscillare: pianifica e verifica i limiti applicabili invece di supporre una spesa identica ogni giorno.',
        ],
        'Non confondere controllo della spesa e obiettivo di ottimizzazione.',
      ),
      lesson(
        'Smart Bidding parte dal risultato',
        [
          'Le strategie orientate alle conversioni cercano azioni; quelle orientate al valore cercano valore di conversione.',
          'Un obiettivo CPA esprime un costo medio desiderato per conversione; non garantisce lo stesso costo a ogni evento.',
          'Misurazione affidabile e obiettivi coerenti sono necessari per valutare la scelta.',
        ],
        'La strategia deve ottimizzare il risultato giusto.',
      ),
      lesson(
        'Quando il valore conta',
        [
          'ROAS confronta valore delle conversioni e spesa pubblicitaria.',
          'Per vendite di valore diverso, considera offerte orientate al valore e un obiettivo ROAS coerente.',
          'Google sta aggiornando le etichette delle strategie nel 2026: riconosci il concetto, non memorizzare solo il nome di un menu.',
        ],
        'Un target ROAS è un obiettivo medio, non una promessa per ordine.',
      ),
    ],
    practice:
      'Un negozio vende prodotti con margini e valori diversi. Spiega perché contare solo il numero delle vendite potrebbe portare a decisioni incomplete.',
    checklist: [
      'Ho distinto quantità di conversioni e valore.',
      'Ho collegato la scelta alla misurazione disponibile.',
    ],
    apply:
      'CorsaLab misura acquisti e relativo valore. Vuole aumentare valore mantenendo un ROAS obiettivo. Proponi una strategia, i dati da validare e un criterio per decidere se rivedere il target.',
    questions: [
      q(
        'Un ecommerce misura valori diversi e vuole un ROAS specifico. Quale approccio scegli?',
        [
          'Massimizzare i clic senza considerare vendite',
          'Offerte orientate al valore con target ROAS',
          'Aumentare tutte le offerte della stessa percentuale',
        ],
        1,
        'L’obiettivo è il valore in rapporto alla spesa: una strategia orientata al valore con ROAS obiettivo è coerente, se la misurazione è affidabile.',
      ),
      q(
        'Un target CPA garantisce identico costo per ogni conversione?',
        ['Sì, è un prezzo fisso per evento', 'No, è un obiettivo medio'],
        1,
        'Le aste e le conversioni variano. Il target descrive un obiettivo medio, non il prezzo garantito di ogni acquisizione.',
      ),
      q(
        'Prima di usare offerte basate sul valore, quale controllo è prioritario?',
        [
          'Accertare valori e azioni di conversione corretti',
          'Raddoppiare il numero di annunci',
          'Nascondere le colonne di costo',
        ],
        0,
        'Valori errati indirizzano l’ottimizzazione verso risultati errati. Più annunci non riparano la misurazione.',
      ),
    ],
  },
  {
    title: 'Performance & Conversioni',
    description:
      'Calcola le metriche e separa segnali, ipotesi e problemi di misurazione.',
    lessons: [
      lesson(
        'Clic, costo e risultati',
        [
          'CTR = clic / impression. CPC medio = costo / clic.',
          'CPA = costo / conversioni. ROAS = valore conversioni / costo.',
          'Il tasso di conversione usa interazioni idonee come denominatore; negli esempi Search assumiamo clic idonei e dati completi.',
        ],
        'Scrivi sempre numeratore, denominatore e periodo.',
      ),
      lesson(
        'Misura ciò che vale',
        [
          'Una conversione rappresenta un’azione che hai definito utile.',
          'Le azioni primarie possono guidare offerte e colonna Conversioni; le secondarie servono di norma all’osservazione.',
          'Verifica tag, eventi, valori e duplicazioni. Un acquisto contato due volte distorce la lettura.',
        ],
        'Un dato misurato male non migliora aumentando il budget.',
      ),
      lesson(
        'CTR alto, poche conversioni',
        [
          'CTR 8% e conversion rate 0,3% descrivono due passaggi diversi del percorso.',
          'Potrebbero esserci disallineamento di intento, attriti nella pagina o problemi di tracking.',
          'I numeri non identificano da soli la causa: controlla termini di ricerca, esperienza e misurazione.',
        ],
        'Prima un’ipotesi verificabile, poi un intervento.',
      ),
    ],
    practice:
      'In un esempio Search: 10.000 impression, 800 clic idonei, 8 acquisti, costo €400 e valore €1.200. Calcola CTR, CPA e ROAS mostrando le formule.',
    checklist: [
      'Ho usato le unità corrette e indicato i denominatori.',
      'Ho distinto valore delle vendite e profitto.',
    ],
    apply:
      'Hai CTR 8%, conversion rate 0,3% e una campagna che consuma il budget. Proponi tre controlli in ordine, separando qualità del traffico, pagina e tracking. Non dichiarare una causa certa senza evidenza.',
    questions: [
      q(
        'Spesa €400 e 8 conversioni: qual è il CPA?',
        ['€50', '€0,02', '€3.200'],
        0,
        'CPA = 400 / 8 = 50 euro per conversione. Il numero richiede una definizione coerente di conversione.',
      ),
      q(
        'CTR 8%, conversion rate 0,3%: quale conclusione è prudente?',
        [
          'È sicuramente colpa del budget',
          'Verifico intento, landing page e tracking',
          'Il CTR dimostra che la campagna è redditizia',
        ],
        1,
        'I dati segnalano una distanza tra clic e risultati, ma non provano una causa né la redditività.',
      ),
      q(
        'Valore conversioni €1.200, costo €400: qual è il ROAS?',
        ['30%', '300% (3 volte la spesa)', '€800 di profitto certo'],
        1,
        '1.200 / 400 = 3, cioè 300%. ROAS non coincide con profitto: mancano costi del prodotto e altri costi.',
      ),
    ],
  },
  {
    title: 'Campaign Strategy',
    description:
      'Costruisci una decisione verificabile, dal canale al prossimo esperimento.',
    lessons: [
      lesson(
        'Scegli il contesto della campagna',
        [
          'Una domanda di acquisto esplicita può essere intercettata con Search.',
          'Scoperta e notorietà possono richiedere altri formati e una diversa lettura dei risultati.',
          'Parti da obiettivo, pubblico, asset disponibili e misurazione: nessun tipo di campagna è sempre il migliore.',
        ],
        'La campagna è una scelta strategica, non una scorciatoia.',
      ),
      lesson(
        'Alloca il budget con un’ipotesi',
        [
          'Confronta risultati omogenei per periodo, obiettivo e qualità della misurazione.',
          'Un CPA minore non basta se le conversioni hanno qualità o valore diversi.',
          'Pianifica un test e un criterio di successo prima di spostare la spesa.',
        ],
        'Valuta l’effetto marginale, non soltanto le medie storiche.',
      ),
      lesson(
        'Ottimizza un problema alla volta',
        [
          'Definisci quale problema vuoi risolvere: volume, valore, costo o qualità.',
          'Scegli un cambiamento coerente e un periodo di valutazione adeguato ai ritardi delle conversioni.',
          'Documenta il risultato e la prossima scelta; evita molte modifiche simultanee difficili da interpretare.',
        ],
        'Obiettivo → diagnosi → test → lettura → decisione.',
      ),
    ],
    practice:
      'Due campagne hanno CPA diversi ma anche valori medi d’ordine diversi. Scrivi quali altri dati chiedi prima di riallocare il budget.',
    checklist: [
      'Ho considerato valore e qualità oltre al CPA.',
      'Ho richiesto dati confrontabili per periodo e tracking.',
    ],
    apply:
      'CorsaLab vuole far crescere le vendite trail. Prepara un piano sintetico: obiettivo, campagna, intento, misurazione, offerta e un esperimento. Indica cosa ti farebbe confermare o cambiare la strategia.',
    questions: [
      q(
        'Quale piano permette di capire meglio l’effetto di un cambiamento?',
        [
          'Cambiare pubblico, landing e offerte nello stesso giorno senza note',
          'Formulare un’ipotesi e misurare un test coerente',
        ],
        1,
        'Un test documentato rende più interpretabile il risultato; molte modifiche simultanee rendono difficile attribuire l’effetto.',
      ),
      q(
        'La campagna A ha CPA più basso di B. Sposti tutto il budget su A?',
        [
          'Sì, basta il CPA',
          'Prima confronto valore, qualità, volumi e misurazione',
        ],
        1,
        'CPA è una media parziale. Valore e qualità possono cambiare la convenienza della riallocazione.',
      ),
      q(
        'Quale obiettivo si presta a intercettare domanda esplicita su Search?',
        [
          'Vendere scarpe trail a chi le cerca',
          'Garantire che tutti ricordino il marchio senza misurazione',
        ],
        0,
        'Search consente di rispondere a una ricerca espressa. Non garantisce notorietà universale né vendite automatiche.',
      ),
    ],
  },
];
const skillNames = [
  [
    'ads-account-structure',
    'Strutturazione di campagne Search',
    'Organizzare obiettivi, campagne e gruppi coerenti.',
  ],
  [
    'ads-keyword-research',
    'Ricerca e selezione keyword',
    'Distinguere intenti, corrispondenze e pertinenza del messaggio.',
  ],
  [
    'ads-audience-strategy',
    'Segmentazione e lettura dei pubblici',
    'Distinguere targeting, osservazione e segmenti di dati propri.',
  ],
  [
    'ads-bidding-strategy',
    'Scelta delle strategie di bidding',
    'Collegare budget, CPA e ROAS al risultato aziendale.',
  ],
  [
    'ads-measurement',
    'Conversion tracking e analisi delle performance',
    'Controllare misurazione e interpretare correttamente le metriche.',
  ],
  [
    'ads-campaign-optimization',
    'Ottimizzazione delle campagne',
    'Definire test e decisioni di budget motivati dai dati.',
  ],
  [
    'ads-exam-readiness',
    'Ragionamento su casi Google Ads',
    'Integrare gli argomenti e riconoscere le aree da ripassare.',
  ],
];
const badgeNames = [
  'Auction Ready',
  'Keyword Hunter',
  'Quality Signal',
  'ROAS Pilot',
  'Conversion Tracker',
  'Campaign Strategist',
];
export const adsAchievements: Achievement[] = badgeNames.map((name, n) => ({
  id: `ads-${name.toLowerCase().replaceAll(' ', '-')}`,
  name,
  rarity: n < 2 ? 'Comune' : n < 4 ? 'Distintivo' : 'Raro',
  image: './covers/ads-performance.svg',
  description: `Hai applicato e verificato gli argomenti di ${content[n].title}.`,
  criterion: `Completa le cinque fasi del Modulo ${n + 1}.`,
  result: `${content[n].title} · modulo completato`,
  unlockCondition: { kind: 'moduleComplete', module: n },
  earned: (state) =>
    Object.hasOwn(
      state.achievementAwards,
      `ads-${name.toLowerCase().replaceAll(' ', '-')}`,
    ),
}));
const competencies = skillNames.map(
  ([id, name, description], sourceModule) => ({
    id,
    name,
    description,
    sourceModule,
  }),
);
const makeModule = (n: number): CourseModule => {
  const data = content[n],
    id = `ads-module-${n + 1}`;
  const activities: Activity[] = [
    ...data.lessons.map(
      (slide, i): Activity => ({
        id: `${id}:learn-${i + 1}`,
        type: 'microLesson',
        phase: 'learn',
        title: slide.title,
        description: slide.takeaway,
        slide: presentLessonSlide(slide, 'google-ads', n, i),
        completionRule: { kind: 'acknowledge' },
        xpReward: XP_REWARDS.microLesson,
      }),
    ),
    {
      id: `${id}:practice`,
      type: 'textInput',
      phase: 'practice',
      title: 'Prova una decisione',
      description: data.practice,
      completionRule: {
        kind: 'textChecklist',
        minLength: 30,
        checklist: data.checklist,
      },
      xpReward: XP_REWARDS.practice,
    },
    ...data.questions.map(
      (question, i): Activity => ({
        id: `${id}:verify-${i + 1}`,
        type: i === 0 ? 'comparison' : 'multipleChoice',
        phase: 'verify',
        title: `Verifica ${i + 1}`,
        description: question.goal,
        question,
        questionLabel: 'Opzione',
        completionRule: { kind: 'correctAnswer' },
        xpReward: XP_REWARDS.verification,
      }),
    ),
    {
      id: `${id}:apply`,
      type: 'scenario',
      phase: 'apply',
      title: 'Applica al caso CorsaLab',
      description: data.apply,
      completionRule: {
        kind: 'textChecklist',
        minLength: 60,
        checklist: [
          'Ho motivato la scelta in base all’obiettivo.',
          'Ho indicato dati e controlli necessari.',
          'Ho descritto come valuterei il risultato.',
        ],
      },
      xpReward: XP_REWARDS.application,
    },
    {
      id: `${id}:unlock`,
      type: 'unlock',
      phase: 'unlock',
      title: 'Sblocca il risultato',
      description: 'Conferma il lavoro svolto e continua al modulo successivo.',
      completionRule: { kind: 'allPhases' },
      xpReward: XP_REWARDS.module,
    },
  ];
  return {
    id,
    title: data.title,
    description: data.description,
    competencyId: competencies[n].id,
    achievementId: adsAchievements[n].id,
    xpReward: XP_REWARDS.module,
    activities,
    phases: PHASES.map((p) => ({
      ...p,
      purpose:
        p.id === 'practice'
          ? 'Prendi una decisione motivata sul caso proposto.'
          : p.purpose,
      activities: activities.filter((a) => a.phase === p.id),
    })),
  };
};
const modules = content.map((_, n) => makeModule(n));
// Alternate activity types use the same completion engine, not separate players.
Object.assign(modules[0].activities[6], {
  type: 'ordering',
  question: undefined,
  title: 'Ricostruisci la struttura',
  description: 'Ordina dal contenitore più ampio al più specifico.',
  completionRule: { kind: 'correctSequence' },
  interaction: {
    items: [
      { id: 'group', label: 'Gruppo di annunci' },
      { id: 'account', label: 'Account' },
      { id: 'campaign', label: 'Campagna' },
    ],
    correct: ['account', 'campaign', 'group'],
    explanation:
      'L’account contiene campagne; ogni campagna contiene gruppi di annunci con messaggi e targeting correlati.',
    hint: 'Parti dal livello che gestisce le impostazioni generali.',
  },
});
Object.assign(modules[4].activities[4], {
  type: 'matching',
  question: undefined,
  title: 'Abbina metrica e formula',
  description: 'Usa le definizioni: costo €400, 8 conversioni, valore €1.200.',
  completionRule: { kind: 'correctSequence' },
  interaction: {
    items: [
      { id: 'cpa', label: 'CPA' },
      { id: 'roas', label: 'ROAS' },
      { id: 'ctr', label: 'CTR' },
    ],
    options: [
      { id: 'clicks', label: 'Clic / impression' },
      { id: 'cost', label: 'Costo / conversioni' },
      { id: 'value', label: 'Valore conversioni / costo' },
    ],
    correct: ['cost', 'value', 'clicks'],
    explanation:
      'CPA misura costo per risultato; ROAS confronta valore e spesa; CTR confronta clic e impression. Hanno denominatori differenti.',
    hint: 'Distingui costo per risultato, ritorno sulla spesa e frequenza dei clic.',
  },
});
const questions: ExamQuestion[] = content.flatMap((data, n) =>
  data.questions.map((item, i) => ({
    id: `ads-exam-${n + 1}-${i + 1}`,
    topic: data.title,
    sourceModule: n,
    title: item.goal,
    options: item.options,
    correct: item.correct,
    explanation: item.why,
  })),
);
const examId = 'ads-module-7';
const examLessons = [
  lesson(
    'Preparati a ragionare',
    [
      'Questa è una simulazione AI Academy, non un esame Google né una certificazione ufficiale.',
      'Il test combina 12 quesiti originali: due per ciascuno dei sei argomenti studiati.',
      'Le risposte vengono spiegate soltanto dopo l’invio finale. Puoi riprovare con una nuova selezione.',
    ],
    'Il risultato orienta il ripasso, non garantisce l’esito ufficiale.',
  ),
  lesson(
    'Leggi prima l’obiettivo',
    [
      'Individua il risultato richiesto nel caso.',
      'Controlla dati, qualità della misurazione e vincoli.',
      'Scarta le risposte che promettono risultati certi senza evidenze.',
    ],
    'Obiettivo, dati e vincoli prima del nome della strategia.',
  ),
  lesson(
    'Usa gli errori come programma di studio',
    [
      'Il riepilogo separa il risultato per argomento.',
      'Una percentuale su pochi quesiti è un segnale di ripasso, non una misura completa della preparazione.',
      'Le certificazioni Google sono distinte per area. Questo percorso privilegia Search e misurazione; consulta Skillshop per il percorso ufficiale scelto.',
    ],
    'Ripassa il perché della scelta, non la lettera della risposta.',
  ),
];
const examActivities: Activity[] = [
  ...examLessons.map(
    (slide, i): Activity => ({
      id: `${examId}:learn-${i + 1}`,
      type: 'microLesson',
      phase: 'learn',
      title: slide.title,
      description: slide.takeaway,
      slide,
      completionRule: { kind: 'acknowledge' },
      xpReward: XP_REWARDS.microLesson,
    }),
  ),
  {
    id: `${examId}:practice`,
    type: 'textInput',
    phase: 'practice',
    title: 'Prepara il tuo metodo',
    description:
      'Scrivi tre controlli che farai prima di scegliere una risposta e indica l’argomento che senti meno sicuro.',
    completionRule: {
      kind: 'textChecklist',
      minLength: 30,
      checklist: [
        'Ho indicato un metodo di lettura e un argomento da ripassare.',
      ],
    },
    xpReward: XP_REWARDS.practice,
  },
  {
    id: `${examId}:exam`,
    type: 'exam',
    phase: 'verify',
    title: 'Simulazione esame',
    description:
      '12 quesiti originali, soluzioni al termine. Obiettivo didattico: almeno 80%. Nessun timer e nessun limite ai tentativi.',
    completionRule: { kind: 'examPassed' },
    xpReward: XP_REWARDS.verification,
  },
  {
    id: `${examId}:apply`,
    type: 'scenario',
    phase: 'apply',
    title: 'Trasforma il risultato in un piano',
    description:
      'Dopo la simulazione, indica un errore o una scelta difficile. Spiega la regola corretta e come la applicheresti al caso CorsaLab.',
    completionRule: {
      kind: 'textChecklist',
      minLength: 60,
      checklist: [
        'Ho spiegato il ragionamento, non soltanto una risposta.',
        'Ho indicato un’azione concreta di ripasso o applicazione.',
      ],
    },
    xpReward: XP_REWARDS.application,
  },
  {
    id: `${examId}:unlock`,
    type: 'unlock',
    phase: 'unlock',
    title: 'Concludi il percorso di preparazione',
    description:
      'Raccogli le competenze costruite e consulta il percorso ufficiale su Skillshop.',
    completionRule: { kind: 'allPhases' },
    xpReward: XP_REWARDS.module,
  },
];
modules.push({
  id: examId,
  title: 'Exam Simulation',
  description: 'Metti insieme gli argomenti e costruisci un piano di ripasso.',
  competencyId: competencies[6].id,
  achievementId: null,
  xpReward: XP_REWARDS.module,
  activities: examActivities,
  phases: PHASES.map((p) => ({
    ...p,
    activities: examActivities.filter((a) => a.phase === p.id),
  })),
});
export const googleAdsCourse: Course = {
  id: 'google-ads',
  slug: 'google-ads-accelerator',
  title: 'Google Ads Accelerator',
  description:
    'Preparati alla certificazione Google Ads con teoria, casi pratici e simulazioni.',
  category: 'Marketing digitale',
  level: 'Professionale',
  duration: '150 minuti stimati',
  cover: './covers/ads-performance.svg',
  modules,
  achievements: adsAchievements,
  competencies,
  storageKey: 'ai-academy-google-ads-v3',
  certificatePrefix: 'ADS',
  certificateNotice:
    'Attestato AI Academy di partecipazione; non è una certificazione Google né una qualifica accreditata.',
  reference: {
    title: 'Il caso CorsaLab',
    text: 'CorsaLab è un ecommerce inventato di scarpe running e trail. Tutte le cifre e gli scenari del corso sono esempi didattici, non dati di campagne reali.',
  },
  sources,
  reviewedAt: '2026-09-07',
  notice:
    'Preparazione indipendente, con focus Search e misurazione. Non è una certificazione Google né una simulazione ufficiale. Per l’esame della tua area consulta Skillshop.',
  exam: { questionCount: 12, perTopic: 2, passPercent: 80, questions },
};
