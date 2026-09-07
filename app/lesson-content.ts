export type LessonSlide = {
  title: string;
  steps: string[];
  takeaway: string;
  layout?:
    | 'concept'
    | 'process'
    | 'comparison'
    | 'editorial'
    | 'article'
    | 'diagram'
    | 'sequence'
    | 'example'
    | 'insight';
  source?: { publisher: string; title: string; url: string };
  keywords?: string[];
  sequence?: { title: string; text: string }[];
  exampleLabel?: string;
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

const promptingSource = {
  publisher: 'Google AI for Developers',
  title: 'Prompt design strategies',
  url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
};
const biddingSource = {
  publisher: 'Google Ads',
  title: 'Informazioni sulle offerte basate su CPA target',
  url: 'https://support.google.com/google-ads/answer/6268632?hl=it',
};
/** Enrich existing steps; identifiers, ordering and rewards are unchanged. */
export function presentLessonSlide(
  slide: LessonSlide,
  courseId: string,
  moduleIndex: number,
  slideIndex: number,
): LessonSlide {
  const key = `${courseId}:${moduleIndex}:${slideIndex}`;
  const variants: Record<string, Partial<LessonSlide>> = {
    'ai-basics:1:0': {
      layout: 'article',
      eyebrow: 'PER APPROFONDIRE',
      source: promptingSource,
      steps: [
        'Un prompt è una consegna. Specificare il compito e il risultato desiderato riduce le decisioni lasciate al modello.',
        'Il contesto orienta la risposta: indica il pubblico e fornisci le informazioni necessarie. I vincoli definiscono lunghezza, tono e ciò che va evitato.',
        'Un esempio del formato atteso può rendere la richiesta più concreta. Prova il prompt, osserva la risposta e correggi ciò che non funziona: la progettazione è un processo iterativo.',
      ],
      keywords: ['compito', 'contesto', 'vincoli', 'formato', 'iterativo'],
    },
    'ai-basics:1:1': {
      layout: 'diagram',
      principles: [
        { title: 'Obiettivo', text: 'Che cosa deve fare?' },
        { title: 'Contesto', text: 'Per chi e con quali informazioni?' },
        { title: 'Formato', text: 'Come presentare il risultato?' },
        { title: 'Vincoli', text: 'Cosa rispettare o evitare?' },
      ],
    },
    'ai-basics:1:2': {
      layout: 'example',
      exampleLabel: 'CASO SIMULATO · OFFICINA PEDALE',
    },
    'ai-basics:2:0': {
      layout: 'sequence',
      sequence: [
        { title: 'Osserva', text: slide.steps[0] },
        { title: 'Individua', text: slide.steps[1] },
        { title: 'Correggi', text: slide.steps[2] },
      ],
    },
    'ai-basics:2:1': {
      layout: 'example',
      exampleLabel: 'BOZZA SIMULATA · OFFICINA PEDALE',
    },
    'ai-basics:2:2': { layout: 'insight' },
    'ai-basics:3:2': {
      layout: 'sequence',
      sequence: [
        { title: 'Fedele', text: slide.steps[0] },
        { title: 'Adatto', text: slide.steps[1] },
        { title: 'Utilizzabile', text: slide.steps[2] },
      ],
    },
    'google-ads:0:1': {
      layout: 'diagram',
      principles: [
        { title: 'Account', text: 'Impostazioni generali e fatturazione.' },
        { title: 'Campagne', text: 'Budget e distribuzione.' },
        { title: 'Gruppi', text: 'Annunci e targeting coerenti.' },
      ],
    },
    'google-ads:0:2': { layout: 'insight' },
    'google-ads:3:1': {
      layout: 'article',
      eyebrow: 'PER APPROFONDIRE',
      source: biddingSource,
      steps: [
        'Il CPA target indica il costo medio che vorresti sostenere per una conversione. Google Ads adegua le offerte alle singole aste usando dati e segnali di contesto.',
        'Il target non è un prezzo fisso: alcune conversioni possono costare di più, altre di meno. Per valutare la strategia confronta il CPA effettivo con il target medio nel periodo osservato.',
        'Prima di attivare una strategia orientata alle conversioni, configura il monitoraggio delle azioni che contano per la tua attività. La scelta del risultato da misurare viene prima dell’ottimizzazione.',
      ],
      keywords: [
        'costo medio',
        'non è un prezzo fisso',
        'monitoraggio',
        'conversioni',
      ],
    },
    'google-ads:3:2': { layout: 'insight' },
  };
  return { ...slide, ...variants[key] };
}
