import type { LearningState } from './progress';

export type Rarity = 'Comune' | 'Distintivo' | 'Raro' | 'Élite' | 'Leggendario';

export type Achievement = {
  id: string;
  name: string;
  rarity: Rarity;
  image: string;
  description: string;
  criterion: string;
  result: string;
  unlockCondition:
    | { kind: 'moduleComplete'; module: number }
    | { kind: 'studyStreak'; days: number };
  earned: (state: LearningState) => boolean;
};

export const achievements: Achievement[] = [
  {
    id: 'signal-frame',
    name: 'Signal Frame',
    rarity: 'Comune',
    image: './achievements/signal-frame.png',
    description:
      'Hai iniziato a distinguere una richiesta vaga da una consegna utile.',
    criterion: 'Completa Impara, Prova, Verifica e Applica del Modulo 1.',
    result: 'Prima decisione critica completata',
    unlockCondition: { kind: 'moduleComplete', module: 0 },
    earned: (state) => Object.hasOwn(state.achievementAwards, 'signal-frame'),
  },
  {
    id: 'prompt-architect',
    name: 'Prompt Architect',
    rarity: 'Distintivo',
    image: './achievements/prompt-architect.png',
    description:
      'Sai costruire richieste con contesto, obiettivo, vincoli e formato.',
    criterion: 'Completa il modulo 2 dedicato alla struttura del prompt.',
    result: 'Metodo di prompting strutturato acquisito',
    unlockCondition: { kind: 'moduleComplete', module: 1 },
    earned: (state) =>
      Object.hasOwn(state.achievementAwards, 'prompt-architect'),
  },
  {
    id: 'fact-lens',
    name: 'Fact Lens',
    rarity: 'Raro',
    image: './achievements/fact-lens.png',
    description:
      'Riconosci affermazioni fragili e sai stabilire cosa verificare.',
    criterion: 'Completa il modulo 4 su errori, fonti e controllo dei fatti.',
    result: 'Protocollo di verifica applicato',
    unlockCondition: { kind: 'moduleComplete', module: 3 },
    earned: (state) => Object.hasOwn(state.achievementAwards, 'fact-lens'),
  },
  {
    id: 'data-vault',
    name: 'Data Vault',
    rarity: 'Raro',
    image: './achievements/data-vault.png',
    description:
      'Sai lavorare con esempi realistici proteggendo dati e informazioni sensibili.',
    criterion: 'Completa il modulo 5 sulla gestione responsabile dei dati.',
    result: 'Pratica sicura sui dati dimostrata',
    unlockCondition: { kind: 'moduleComplete', module: 4 },
    earned: (state) => Object.hasOwn(state.achievementAwards, 'data-vault'),
  },
  {
    id: 'momentum-orbit',
    name: 'Momentum Orbit',
    rarity: 'Élite',
    image: './achievements/momentum-orbit.png',
    description:
      'Hai trasformato lo studio in una pratica continua e intenzionale.',
    criterion: 'Studia per 3 giorni consecutivi sullo stesso dispositivo.',
    result: 'Serie di studio di 3 giorni raggiunta',
    unlockCondition: { kind: 'studyStreak', days: 3 },
    earned: (state) => Object.hasOwn(state.achievementAwards, 'momentum-orbit'),
  },
  {
    id: 'applied-intelligence',
    name: 'Applied Intelligence',
    rarity: 'Leggendario',
    image: './achievements/applied-intelligence.png',
    description:
      'Hai completato l’intero percorso e trasformato le basi dell’AI in un metodo operativo.',
    criterion: 'Completa tutti i 6 moduli e le cinque fasi di ogni modulo.',
    result: 'Corso completato · metodo applicato',
    unlockCondition: { kind: 'moduleComplete', module: 5 },
    earned: (state) =>
      Object.hasOwn(state.achievementAwards, 'applied-intelligence'),
  },
];
