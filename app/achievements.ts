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
  earned: (state: LearningState) => boolean;
};

export const achievements: Achievement[] = [
  {
    id: 'signal-frame',
    name: 'Signal Frame',
    rarity: 'Comune',
    image: '/achievements/signal-frame.png',
    description: 'Hai iniziato a distinguere una richiesta vaga da una consegna utile.',
    criterion: 'Risolvi correttamente la prima sfida sui prompt.',
    result: 'Prima decisione critica completata',
    earned: (state) => state.solved.length >= 1,
  },
  {
    id: 'prompt-architect',
    name: 'Prompt Architect',
    rarity: 'Distintivo',
    image: '/achievements/prompt-architect.png',
    description: 'Sai costruire richieste con contesto, obiettivo, vincoli e formato.',
    criterion: 'Completa il modulo 2 dedicato alla struttura del prompt.',
    result: 'Metodo di prompting strutturato acquisito',
    earned: (state) => state.completed.includes(1),
  },
  {
    id: 'fact-lens',
    name: 'Fact Lens',
    rarity: 'Raro',
    image: '/achievements/fact-lens.png',
    description: 'Riconosci affermazioni fragili e sai stabilire cosa verificare.',
    criterion: 'Completa il modulo 4 su errori, fonti e controllo dei fatti.',
    result: 'Protocollo di verifica applicato',
    earned: (state) => state.completed.includes(3),
  },
  {
    id: 'data-vault',
    name: 'Data Vault',
    rarity: 'Raro',
    image: '/achievements/data-vault.png',
    description: 'Sai lavorare con esempi realistici proteggendo dati e informazioni sensibili.',
    criterion: 'Completa il modulo 5 sulla gestione responsabile dei dati.',
    result: 'Pratica sicura sui dati dimostrata',
    earned: (state) => state.completed.includes(4),
  },
  {
    id: 'momentum-orbit',
    name: 'Momentum Orbit',
    rarity: 'Élite',
    image: '/achievements/momentum-orbit.png',
    description: 'Hai trasformato lo studio in una pratica continua e intenzionale.',
    criterion: 'Studia per 3 giorni consecutivi sullo stesso dispositivo.',
    result: 'Serie di studio di 3 giorni raggiunta',
    earned: (state) => state.streakDays >= 3,
  },
  {
    id: 'applied-intelligence',
    name: 'Applied Intelligence',
    rarity: 'Leggendario',
    image: '/achievements/applied-intelligence.png',
    description: 'Hai completato l’intero percorso e trasformato le basi dell’AI in un metodo operativo.',
    criterion: 'Completa tutti i 6 moduli e le 42 attività.',
    result: 'Corso completato · 600 XP conquistati',
    earned: (state) => state.completed.length === 6,
  },
];
