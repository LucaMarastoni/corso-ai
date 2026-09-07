export type LessonSlide = {
  title: string;
  steps: string[];
  takeaway: string;
  layout?: 'concept' | 'process' | 'comparison' | 'editorial';
  eyebrow?: string;
  calloutLabel?: string;
  caption?: string;
  nodes?: {
    label: string;
    text: string;
    icon: 'data' | 'ai' | 'result' | 'input' | 'mail';
  }[];
  comparison?: { label: string; prompt: string; output: string }[];
  principles?: { title: string; text: string }[];
};
export const introSlides: LessonSlide[] = [
  {
    layout: 'concept',
    eyebrow: 'AI · LE BASI',
    title: 'Cos’è davvero l’intelligenza artificiale?',
    steps: [
      'L’intelligenza artificiale permette a un sistema di analizzare informazioni, riconoscere schemi e produrre un risultato.',
    ],
    nodes: [
      { label: 'DATI', text: 'Informazioni da cui imparare', icon: 'data' },
      {
        label: 'MODELLO AI',
        text: 'Analizza, trova schemi e impara',
        icon: 'ai',
      },
      {
        label: 'RISULTATO',
        text: 'Contenuti, risposte o previsioni',
        icon: 'result',
      },
    ],
    takeaway: 'L’AI non parte dal nulla: lavora su ciò che ha imparato.',
  },
  {
    layout: 'process',
    eyebrow: 'AI · LE BASI',
    title: 'E quando l’AI crea?',
    steps: [
      'L’AI generativa produce nuovi contenuti partendo dalle istruzioni ricevute.',
    ],
    nodes: [
      { label: 'INPUT', text: '“Scrivimi una breve email”', icon: 'input' },
      { label: 'AI GENERATIVA', text: '', icon: 'ai' },
      { label: 'OUTPUT', text: '“Ciao Marco, ti scrivo per…”', icon: 'mail' },
    ],
    caption: 'Più chiara è la richiesta, più utile sarà il risultato.',
    calloutLabel: 'IN PRATICA',
    takeaway: 'L’AI crea, ma parte sempre da un input umano.',
  },
  {
    layout: 'comparison',
    eyebrow: 'AI · LE BASI',
    title: 'Tu dai la direzione.',
    steps: [
      'Un prompt vago lascia spazio al caso. Un prompt chiaro dà una direzione.',
    ],
    comparison: [
      {
        label: 'PROMPT VAGO',
        prompt: '“Scrivimi una mail”',
        output: 'Output generico',
      },
      {
        label: 'PROMPT CHIARO',
        prompt:
          '“Scrivi una mail professionale di massimo 120 parole per chiedere conferma di un appuntamento”',
        output: 'Output strutturato',
      },
    ],
    principles: [
      { title: 'Obiettivo', text: 'Cosa vuoi ottenere?' },
      { title: 'Contesto', text: 'Dai le informazioni utili.' },
      { title: 'Formato', text: 'Indica il tipo di contenuto.' },
      { title: 'Vincoli', text: 'Specifica limiti e preferenze.' },
    ],
    takeaway: 'Più contesto dai, migliore sarà la risposta.',
  },
];
