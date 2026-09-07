import type { Activity, PhaseId } from './learning-model';
import type { Achievement } from './achievements';
export type CourseModule = {
  id: string;
  title: string;
  description: string;
  competencyId: string;
  achievementId: string | null;
  xpReward: number;
  activities: Activity[];
  phases: {
    id: PhaseId;
    name: string;
    purpose: string;
    activities: Activity[];
  }[];
};
export type CompetencyDefinition = {
  id: string;
  name: string;
  description: string;
  sourceModule: number;
};
export type ExamQuestion = {
  id: string;
  topic: string;
  sourceModule: number;
  title: string;
  options: string[];
  correct: number;
  explanation: string;
};
export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  cover: string;
  modules: CourseModule[];
  achievements: Achievement[];
  competencies: CompetencyDefinition[];
  storageKey: string;
  legacyStorageKey?: string;
  certificatePrefix: string;
  reference: { title: string; text: string };
  materials?: string;
  certificateNotice?: string;
  sources?: { title: string; url: string }[];
  reviewedAt?: string;
  notice?: string;
  exam?: {
    questionCount: number;
    perTopic: number;
    passPercent: number;
    questions: ExamQuestion[];
  };
};
