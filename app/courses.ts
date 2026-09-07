import { courseModules, competencyDefinitions } from './learning-model.ts';
import { achievements } from './achievements.ts';
import { googleAdsCourse } from './google-ads.ts';
import type { Course } from './course-types.ts';
export const DEFAULT_COURSE_ID = 'ai-basics';
export const courses: Course[] = [
  {
    id: DEFAULT_COURSE_ID,
    slug: 'basi-intelligenza-artificiale',
    title: 'Basi di Intelligenza Artificiale',
    description:
      'Comprendi l’AI, scrivi prompt efficaci e verifica le risposte nel lavoro.',
    category: 'Intelligenza artificiale',
    level: 'Base',
    duration: '60 minuti stimati',
    cover: './brand/ai-academy-mark.png',
    modules: courseModules,
    achievements,
    competencies: competencyDefinitions,
    storageKey: 'ai-course-journey-v3',
    legacyStorageKey: 'ai-course-journey-v2',
    certificatePrefix: 'PAI',
    reference: {
      title: 'Il brief di Officina Pedale',
      text: 'Attività inventata. Ripara bici urbane, esegue manutenzione freni, sostituisce camere d’aria. Appuntamenti tramite modulo di contatto. Prezzi, orari, indirizzo e tempi non disponibili.',
    },
    materials: './materiali/dispensa.md',
  },
  googleAdsCourse,
];
export const getCourse = (id = DEFAULT_COURSE_ID): Course =>
  courses.find((course) => course.id === id || course.slug === id) ||
  courses[0];
export const courseActivityCount = (id?: string) =>
  getCourse(id).modules.reduce(
    (sum, module) => sum + module.activities.length,
    0,
  );
export const courseXp = (id?: string) =>
  getCourse(id).modules.reduce(
    (sum, module) =>
      sum + module.activities.reduce((xp, a) => xp + a.xpReward, 0),
    0,
  );
