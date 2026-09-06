import { levels } from './journey.ts';
import { XP_REWARDS } from './learning-config.ts';
export type PhaseId = 'learn' | 'practice' | 'verify' | 'apply' | 'unlock';
export const PHASES: { id: PhaseId; name: string; purpose: string }[] = [
  { id: 'learn', name: 'Impara', purpose: 'Scopri i concetti essenziali.' },
  {
    id: 'practice',
    name: 'Prova',
    purpose: 'Sperimenta con una prima richiesta.',
  },
  {
    id: 'verify',
    name: 'Verifica',
    purpose: 'Confronta le alternative e ragiona sulle scelte.',
  },
  {
    id: 'apply',
    name: 'Applica',
    purpose: 'Trasferisci il metodo in un contesto realistico.',
  },
  {
    id: 'unlock',
    name: 'Sblocca',
    purpose: 'Raccogli il risultato del tuo lavoro.',
  },
];
export type Activity = {
  id: string;
  type: 'microLesson' | 'textInput' | 'comparison' | 'scenario' | 'unlock';
  phase: PhaseId;
  title: string;
  description: string;
  completionRule: {
    kind: 'acknowledge' | 'textChecklist' | 'correctAnswer' | 'allPhases';
    minLength?: number;
    checklist?: string[];
  };
  xpReward: number;
  slide?: (typeof levels)[number]['slides'][number];
  question?: (typeof levels)[number]['challenges'][number];
  model?: string;
};
const practice = [
  [
    'Scrivi il tuo primo prompt',
    'Chiedi a un assistente AI di scrivere una breve email professionale per chiedere a un cliente di confermare una riunione. Usa nomi inventati.',
    'Ho indicato a chi è rivolta la mail e che cosa deve ottenere.',
  ],
  [
    'Dai una struttura alla richiesta',
    'Scrivi una richiesta per tre titoli di una pagina dedicata alla riparazione di bici urbane. Specifica pubblico e formato.',
    'Ho indicato obiettivo, pubblico e formato.',
  ],
  [
    'Prova un feedback utile',
    'La prima bozza è troppo lunga e informale. Scrivi un feedback che chieda una revisione precisa, indicando cosa mantenere.',
    'Ho indicato cosa cambiare e cosa mantenere.',
  ],
  [
    'Segnala ciò che non sai',
    'Una bozza dice: «Ripariamo tutte le bici in 10 minuti». Non hai dati sui tempi. Chiedi una revisione che elimini la promessa non verificata.',
    'Ho identificato la promessa e chiesto di non inventare informazioni.',
  ],
  [
    'Prepara un contesto sicuro',
    'Devi far riassumere una richiesta di assistenza. Scrivi un esempio inventato e sostituisci nome, telefono e indirizzo con segnaposto.',
    'Ho usato soltanto dati inventati o segnaposto.',
  ],
  [
    'Imposta il tuo lavoro finale',
    'Scrivi il brief per un piccolo kit di comunicazione di Officina Pedale: specifica destinatari, contenuti da produrre e controlli finali.',
    'Ho definito contenuti, destinatari e un controllo finale.',
  ],
];
export const competencyDefinitions = [
  [
    'fundamental-prompting',
    'Prompting fondamentale',
    'Scrivere richieste chiare e scegliere un compito di cui puoi controllare il risultato.',
  ],
  [
    'structured-prompting',
    'Scrittura di prompt strutturati',
    'Specificare obiettivo, contesto, formato e vincoli di una consegna.',
  ],
  [
    'critical-evaluation',
    'Valutazione critica delle risposte AI',
    'Rivedere una bozza e dare feedback precisi senza perdere informazioni utili.',
  ],
  [
    'fact-checking',
    'Verifica delle informazioni',
    'Individuare affermazioni non supportate e definire come verificarle.',
  ],
  [
    'context-management',
    'Gestione responsabile del contesto',
    'Fornire informazioni utili proteggendo dati personali e riservati.',
  ],
  [
    'professional-ai',
    'Uso professionale dell’AI',
    'Applicare richiesta, revisione e controllo a un insieme coerente di contenuti.',
  ],
].map(([id, name, description], sourceModule) => ({
  id,
  name,
  description,
  sourceModule,
}));
const achievementIds = [
  'signal-frame',
  'prompt-architect',
  null,
  'fact-lens',
  'data-vault',
  'applied-intelligence',
];
export const courseModules = levels.map((level, index) => {
  const prefix = `module-${index + 1}`;
  const activities: Activity[] = [
    ...level.slides.map(
      (slide, i): Activity => ({
        id: `${prefix}:learn-${i + 1}`,
        type: 'microLesson',
        phase: 'learn',
        title: slide.title,
        description: slide.takeaway,
        completionRule: { kind: 'acknowledge' },
        xpReward: XP_REWARDS.microLesson,
        slide,
      }),
    ),
    {
      id: `${prefix}:practice`,
      type: 'textInput',
      phase: 'practice',
      title: practice[index][0],
      description: practice[index][1],
      completionRule: {
        kind: 'textChecklist',
        minLength: 30,
        checklist: [practice[index][2]],
      },
      xpReward: XP_REWARDS.practice,
    },
    ...level.challenges.map(
      (question, i): Activity => ({
        id: `${prefix}:verify-${i + 1}`,
        type: 'comparison',
        phase: 'verify',
        title: `Confronto ${i + 1}: quale prompt funziona meglio?`,
        description: question.goal,
        completionRule: { kind: 'correctAnswer' },
        xpReward: XP_REWARDS.verification,
        question,
      }),
    ),
    {
      id: `${prefix}:apply`,
      type: 'scenario',
      phase: 'apply',
      title:
        index === 0
          ? 'Un prompt per sintetizzare una riunione'
          : 'Metti il metodo al lavoro',
      description:
        index === 0
          ? 'Sei in ufficio a Officina Pedale. Appunti inventati: Giulia prepara una guida alla manutenzione entro venerdì; Marco controlla i testi; i prezzi non sono stati discussi. Scrivi un prompt che chieda un riepilogo per il team con azioni, responsabili e scadenze. Indica contesto, obiettivo, formato e il vincolo di non inventare informazioni.'
          : level.lab,
      completionRule: {
        kind: 'textChecklist',
        minLength: 30,
        checklist:
          index === 0
            ? [
                'Ho fornito il contesto e gli appunti della riunione.',
                'Ho specificato l’obiettivo del riepilogo.',
                'Ho richiesto un formato con azioni, responsabili e scadenze.',
                'Ho vietato di inventare dettagli e indicato cosa controllerò.',
              ]
            : level.criteria,
      },
      xpReward: XP_REWARDS.application,
      model:
        index === 0
          ? 'Aiuta il team di Officina Pedale a organizzare il seguito della riunione. Appunti: Giulia prepara una guida alla manutenzione entro venerdì; Marco controlla i testi; i prezzi non sono stati discussi. Riassumi in una tabella con azione, responsabile e scadenza. Se un dato manca scrivi «da definire», senza inventarlo. Controllerò che nomi, scadenze e attività corrispondano agli appunti.'
          : level.model,
    },
    {
      id: `${prefix}:unlock`,
      type: 'unlock',
      phase: 'unlock',
      title: 'Il risultato del tuo percorso',
      description: 'Conferma il completamento e sblocca il prossimo passo.',
      completionRule: { kind: 'allPhases' },
      xpReward: XP_REWARDS.module,
    },
  ];
  return {
    id: prefix,
    title: level.title,
    description: level.goal,
    competencyId: competencyDefinitions[index].id,
    achievementId: achievementIds[index],
    xpReward: XP_REWARDS.module,
    activities,
    phases: PHASES.map((phase) => ({
      ...phase,
      activities: activities.filter((activity) => activity.phase === phase.id),
    })),
  };
});
export const COURSE_ACTIVITY_COUNT = courseModules.reduce(
  (sum, module) => sum + module.activities.length,
  0,
);
export const COURSE_XP = courseModules.reduce(
  (sum, module) =>
    sum + module.activities.reduce((xp, activity) => xp + activity.xpReward, 0),
  0,
);
export const activityById = (id: string) =>
  courseModules
    .flatMap((module) => module.activities)
    .find((activity) => activity.id === id);
