import {
  courseModules,
  competencyDefinitions,
  COURSE_ACTIVITY_COUNT,
  PHASES,
  type Activity,
} from './learning-model.ts';
import { achievements } from './achievements.ts';
export const STORE = 'ai-course-journey-v3';
export const LEGACY_STORE = 'ai-course-journey-v2';
export type Completion = {
  completedAt: string | null;
  xp: number;
  evidence: string;
  source: 'current' | 'legacy' | 'exemption';
};
export type CompetencyAward = {
  acquiredAt: string | null;
  evidence: string;
  sourceModule: number;
  source: 'current' | 'legacy';
};
export type LearningState = {
  progressVersion: 3;
  level: number;
  step: number;
  completedActivities: Record<string, Completion>;
  drafts: Record<string, string>;
  activityChecks: Record<string, number[]>;
  answers: Record<string, number>;
  achievementAwards: Record<
    string,
    { earnedAt: string | null; source: 'current' | 'legacy' }
  >;
  competencyAwards: Record<string, CompetencyAward>;
  streakDays: number;
  lastStudyDate: string;
  profileName: string;
  certificateId: string;
  completionDate: string;
  // Read-only compatibility projections. serialize excludes them: the ledger is authoritative.
  seen: string[];
  solved: string[];
  completed: number[];
  notes: Record<string, string>;
  checks: Record<string, number[]>;
};
export const initialState: LearningState = {
  progressVersion: 3,
  level: 0,
  step: 0,
  completedActivities: {},
  drafts: {},
  activityChecks: {},
  answers: {},
  achievementAwards: {},
  competencyAwards: {},
  streakDays: 0,
  lastStudyDate: '',
  profileName: '',
  certificateId: '',
  completionDate: '',
  seen: [],
  solved: [],
  completed: [],
  notes: {},
  checks: {},
};
export const keyFor = (level: number, item: number) => `${level}:${item}`;
export const isActivityComplete = (s: LearningState, id: string) =>
  Object.hasOwn(s.completedActivities, id);
export const score = (s: LearningState) =>
  Object.values(s.completedActivities).reduce((sum, item) => sum + item.xp, 0);
export const completedActivityCount = (s: LearningState) =>
  Object.keys(s.completedActivities).length;
export const completionPercent = (s: LearningState) =>
  Math.round((completedActivityCount(s) / COURSE_ACTIVITY_COUNT) * 100);
function project(s: LearningState): LearningState {
  const seen: string[] = [],
    solved: string[] = [],
    completed: number[] = [],
    notes: Record<string, string> = {},
    checks: Record<string, number[]> = {};
  courseModules.forEach((courseModule, n) => {
    courseModule.activities.forEach((activity) => {
      if (!isActivityComplete(s, activity.id)) return;
      if (activity.phase === 'learn')
        seen.push(
          keyFor(n, courseModule.phases[0].activities.indexOf(activity)),
        );
      if (activity.phase === 'verify')
        solved.push(
          keyFor(n, courseModule.phases[2].activities.indexOf(activity)),
        );
      if (activity.phase === 'unlock') completed.push(n);
    });
    notes[n] = s.drafts[`${courseModule.id}:apply`] || '';
    checks[n] = s.activityChecks[`${courseModule.id}:apply`] || [];
  });
  return { ...s, seen, solved, completed, notes, checks };
}
export function unlock(s: LearningState) {
  let n = 0;
  while (
    n < courseModules.length - 1 &&
    isActivityComplete(s, `${courseModules[n].id}:unlock`)
  )
    n++;
  return n;
}
export function phaseComplete(s: LearningState, n: number, phase: string) {
  const activities = courseModules[n]?.phases.find(
    (item) => item.id === phase,
  )?.activities;
  return (
    !!activities?.length &&
    activities.every((activity) => isActivityComplete(s, activity.id))
  );
}
export function activityAvailable(
  s: LearningState,
  n: number,
  activity: Activity,
) {
  if (n > unlock(s)) return false;
  const phaseIndex = PHASES.findIndex((phase) => phase.id === activity.phase);
  return PHASES.slice(0, phaseIndex).every((phase) =>
    phaseComplete(s, n, phase.id),
  );
}
export function canFinish(s: LearningState, n: number) {
  return (
    !!courseModules[n] &&
    PHASES.filter((phase) => phase.id !== 'unlock').every((phase) =>
      phaseComplete(s, n, phase.id),
    )
  );
}
export function canCompleteActivity(
  s: LearningState,
  n: number,
  activity: Activity,
) {
  if (!activityAvailable(s, n, activity)) return false;
  const rule = activity.completionRule;
  if (rule.kind === 'textChecklist')
    return (
      (s.drafts[activity.id] || '').trim().length >= (rule.minLength || 0) &&
      (rule.checklist || []).every((_, i) =>
        (s.activityChecks[activity.id] || []).includes(i),
      )
    );
  if (rule.kind === 'correctAnswer')
    return s.answers[activity.id] === activity.question?.correct;
  if (rule.kind === 'allPhases') return canFinish(s, n);
  return true;
}
export function touchStudy(s: LearningState, today: string): LearningState {
  if (!validDate(today) || s.lastStudyDate === today) return s;
  const consecutive =
    Date.parse(`${today}T00:00:00Z`) -
      Date.parse(`${s.lastStudyDate}T00:00:00Z`) ===
    86400000;
  return {
    ...s,
    streakDays: consecutive ? s.streakDays + 1 : 1,
    lastStudyDate: today,
  };
}
function collectAwards(
  s: LearningState,
  at: string | null,
  source: 'current' | 'legacy',
): LearningState {
  const achievementAwards = { ...s.achievementAwards },
    competencyAwards = { ...s.competencyAwards };
  for (const item of achievements) {
    const condition = item.unlockCondition;
    const eligible =
      condition.kind === 'moduleComplete'
        ? isActivityComplete(s, `${courseModules[condition.module].id}:unlock`)
        : s.streakDays >= condition.days;
    if (eligible && !Object.hasOwn(achievementAwards, item.id))
      achievementAwards[item.id] = { earnedAt: at, source };
  }
  for (const item of competencyDefinitions) {
    const courseModule = courseModules[item.sourceModule];
    if (
      isActivityComplete(s, `${courseModule.id}:unlock`) &&
      !Object.hasOwn(competencyAwards, item.id)
    ) {
      competencyAwards[item.id] = {
        acquiredAt: at,
        sourceModule: item.sourceModule,
        source,
        evidence:
          s.completedActivities[`${courseModule.id}:apply`]?.evidence ||
          'Completamento riconosciuto dal percorso precedente; elaborato non disponibile.',
      };
    }
  }
  return { ...s, achievementAwards, competencyAwards };
}
export function completeActivity(
  s: LearningState,
  n: number,
  id: string,
  now = new Date().toISOString(),
): LearningState {
  const activity = courseModules[n]?.activities.find((item) => item.id === id);
  if (!activity || !canCompleteActivity(s, n, activity)) return s;
  const at = validTimestamp(now) ? now : new Date().toISOString();
  const day = new Date(at).toLocaleDateString('en-CA');
  if (isActivityComplete(s, id))
    return collectAwards(touchStudy(s, day), at, 'current');
  const next = touchStudy(
    {
      ...s,
      completedActivities: {
        ...s.completedActivities,
        [id]: {
          completedAt: at,
          xp: activity.xpReward,
          evidence:
            activity.type === 'comparison'
              ? `Risposta ${String.fromCharCode(65 + s.answers[id])}: ${activity.question?.why}`
              : s.drafts[id]?.trim() ||
                'Conferma esplicita di lettura e comprensione.',
          source: 'current',
        },
      },
    },
    day,
  );
  return project(collectAwards(next, at, 'current'));
}
export const complete = (s: LearningState, n: number) =>
  completeActivity(s, n, `${courseModules[n]?.id}:unlock`);
export function setDraft(
  s: LearningState,
  id: string,
  text: string,
): LearningState {
  return project({ ...s, drafts: { ...s.drafts, [id]: text.slice(0, 20000) } });
}
export function issueCertificate(
  s: LearningState,
  profileName: string,
  completionDate: string,
  certificateId: string,
) {
  const name = profileName.trim().replace(/\s+/g, ' ').slice(0, 80);
  if (
    s.completed.length !== courseModules.length ||
    Object.keys(s.competencyAwards).length !== competencyDefinitions.length ||
    name.length < 3 ||
    !validDate(completionDate) ||
    !/^PAI-\d{4}-[A-Z0-9]{8}$/.test(certificateId)
  )
    return s;
  if (s.certificateId) return s;
  return { ...s, profileName: name, completionDate, certificateId };
}
const validDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const validTimestamp = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export function serialize(s: LearningState) {
  const {
    seen: _seen,
    solved: _solved,
    completed: _completed,
    notes: _notes,
    checks: _checks,
    ...canonical
  } = s;
  return JSON.stringify(canonical);
}
export function restore(raw: string): LearningState {
  let x: Record<string, unknown>;
  try {
    x = record(JSON.parse(raw));
  } catch {
    return project({ ...initialState });
  }
  let s: LearningState = {
    ...initialState,
    completedActivities: {},
    drafts: {},
    activityChecks: {},
    answers: {},
    achievementAwards: {},
    competencyAwards: {},
  };
  s.profileName =
    typeof x.profileName === 'string' ? x.profileName.slice(0, 80) : '';
  s.streakDays = Number.isInteger(x.streakDays)
    ? Math.max(0, Math.min(3650, x.streakDays as number))
    : 0;
  s.lastStudyDate = validDate(x.lastStudyDate) ? x.lastStudyDate : '';
  const legacy = x.progressVersion !== 3;
  for (const courseModule of courseModules) {
    for (const activity of courseModule.activities) {
      const draft = record(x.drafts)[activity.id];
      if (typeof draft === 'string')
        s.drafts[activity.id] = draft.slice(0, 20000);
      const checks = record(x.activityChecks)[activity.id];
      if (Array.isArray(checks))
        s.activityChecks[activity.id] = [
          ...new Set(
            checks.filter(
              (v): v is number =>
                Number.isInteger(v) &&
                v >= 0 &&
                v < (activity.completionRule.checklist?.length || 0),
            ),
          ),
        ];
      const answer = record(x.answers)[activity.id];
      if (
        Number.isInteger(answer) &&
        Number(answer) >= 0 &&
        Number(answer) < (activity.question?.options.length || 0)
      )
        s.answers[activity.id] = Number(answer);
      const completion = record(record(x.completedActivities)[activity.id]);
      if (
        !legacy &&
        ['current', 'legacy', 'exemption'].includes(
          String(completion.source),
        ) &&
        Number.isFinite(completion.xp) &&
        Number(completion.xp) >= 0 &&
        typeof completion.evidence === 'string'
      ) {
        const source =
          completion.source === 'legacy' || completion.source === 'exemption'
            ? completion.source
            : 'current';
        const legacyXp =
          activity.phase === 'verify'
            ? 20
            : activity.phase === 'apply'
              ? 40
              : 0;
        s.completedActivities[activity.id] = {
          source,
          completedAt: validTimestamp(completion.completedAt)
            ? completion.completedAt
            : null,
          xp:
            source === 'current'
              ? activity.xpReward
              : source === 'exemption'
                ? 0
                : legacyXp,
          evidence:
            typeof completion.evidence === 'string'
              ? completion.evidence.slice(0, 20000)
              : '',
        };
      }
    }
  }
  if (legacy) {
    const legacyList = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.filter(
            (v): v is string =>
              typeof v === 'string' && /^[0-5]:[0-2]$/.test(v),
          )
        : [];
    const seen = legacyList(x.seen),
      solved = legacyList(x.solved);
    let contiguous = true;
    courseModules.forEach((courseModule, n) => {
      const add = (
        id: string,
        xp: number,
        evidence = '',
        source: Completion['source'] = 'legacy',
      ) => {
        s.completedActivities[id] = { completedAt: null, xp, evidence, source };
      };
      [0, 1, 2].forEach((i) => {
        if (seen.includes(keyFor(n, i)))
          add(
            `${courseModule.id}:learn-${i + 1}`,
            0,
            'Slide visitata nel percorso precedente.',
          );
        if (solved.includes(keyFor(n, i))) {
          add(
            `${courseModule.id}:verify-${i + 1}`,
            20,
            'Risposta corretta nel percorso precedente.',
          );
          s.answers[`${courseModule.id}:verify-${i + 1}`] =
            courseModule.phases[2].activities[i].question!.correct;
        }
      });
      const note = record(x.notes)[n];
      if (typeof note === 'string')
        s.drafts[`${courseModule.id}:apply`] = note.slice(0, 20000);
      const checks = record(x.checks)[n];
      if (Array.isArray(checks))
        s.activityChecks[`${courseModule.id}:apply`] = [
          ...new Set(
            checks.filter((v): v is number => v === 0 || v === 1 || v === 2),
          ),
        ];
      const finished =
        contiguous &&
        Array.isArray(x.completed) &&
        x.completed.includes(n) &&
        [0, 1, 2].every(
          (i) => seen.includes(keyFor(n, i)) && solved.includes(keyFor(n, i)),
        );
      if (finished) {
        add(
          `${courseModule.id}:practice`,
          0,
          'Esonero: modulo già completato. La nuova pratica non è stata svolta.',
          'exemption',
        );
        add(
          `${courseModule.id}:apply`,
          40,
          typeof note === 'string'
            ? note
            : 'Laboratorio del percorso precedente.',
        );
        add(
          `${courseModule.id}:unlock`,
          0,
          'Modulo riconosciuto dal percorso precedente.',
        );
      } else contiguous = false;
    });
    if (solved.length)
      s.achievementAwards['signal-frame'] = {
        earnedAt: null,
        source: 'legacy',
      };
  }
  // Discard inconsistent later-phase records, but retain previously passed legacy verifications
  // while the learner completes the newly introduced practice.
  for (let n = 0; n < courseModules.length; n++) {
    for (const activity of courseModules[n].activities) {
      const completion = s.completedActivities[activity.id];
      if (!completion) continue;
      if (
        n > unlock(s) ||
        (completion.source === 'current' &&
          !activityAvailable(s, n, activity)) ||
        (activity.phase === 'unlock' && !canFinish(s, n))
      )
        delete s.completedActivities[activity.id];
    }
  }
  s = project(s);
  for (const item of achievements) {
    const saved = record(record(x.achievementAwards)[item.id]);
    if (Object.keys(saved).length)
      s.achievementAwards[item.id] = {
        earnedAt: validTimestamp(saved.earnedAt) ? saved.earnedAt : null,
        source: saved.source === 'legacy' ? 'legacy' : 'current',
      };
  }
  for (const item of competencyDefinitions) {
    const saved = record(record(x.competencyAwards)[item.id]);
    if (s.completed.includes(item.sourceModule) && Object.keys(saved).length)
      s.competencyAwards[item.id] = {
        acquiredAt: validTimestamp(saved.acquiredAt) ? saved.acquiredAt : null,
        evidence:
          typeof saved.evidence === 'string'
            ? saved.evidence.slice(0, 20000)
            : '',
        sourceModule: item.sourceModule,
        source: saved.source === 'legacy' ? 'legacy' : 'current',
      };
  }
  s = collectAwards(s, null, legacy ? 'legacy' : 'current');
  s.level = Number.isInteger(x.level)
    ? Math.max(0, Math.min(unlock(s), Number(x.level)))
    : 0;
  const mappedStep = legacy
    ? Number(x.step) < 3
      ? Number(x.step)
      : Number(x.step) + 1
    : Number(x.step);
  s.step = Number.isInteger(mappedStep)
    ? Math.max(
        0,
        Math.min(courseModules[s.level].activities.length - 1, mappedStep),
      )
    : 0;
  if (!activityAvailable(s, s.level, courseModules[s.level].activities[s.step]))
    s.step = courseModules[s.level].activities.findIndex(
      (a) => activityAvailable(s, s.level, a) && !isActivityComplete(s, a.id),
    );
  if (s.step < 0) s.step = 0;
  if (
    s.completed.length === courseModules.length &&
    typeof x.certificateId === 'string' &&
    /^PAI-\d{4}-[A-Z0-9]{8}$/.test(x.certificateId) &&
    validDate(x.completionDate)
  ) {
    s.certificateId = x.certificateId;
    s.completionDate = x.completionDate;
  }
  return s;
}

export function activeStreak(
  s: LearningState,
  today = new Date().toLocaleDateString('en-CA'),
) {
  const gap =
    Date.parse(`${today}T00:00:00Z`) -
    Date.parse(`${s.lastStudyDate}T00:00:00Z`);
  return gap === 0 || gap === 86400000 ? s.streakDays : 0;
}
