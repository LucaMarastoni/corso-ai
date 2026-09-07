import { PHASES, lessonActivities, type Activity } from './learning-model.ts';
import {
  getCourse,
  DEFAULT_COURSE_ID,
  courseActivityCount,
} from './courses.ts';
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
  courseId: string;
  responses: Record<string, string[]>;
  examAttempts: ExamAttempt[];
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
  courseId: DEFAULT_COURSE_ID,
  responses: {},
  examAttempts: [],
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
  Math.round(
    (completedActivityCount(s) / courseActivityCount(s.courseId)) * 100,
  );
function project(s: LearningState): LearningState {
  const seen: string[] = [],
    solved: string[] = [],
    completed: number[] = [],
    notes: Record<string, string> = {},
    checks: Record<string, number[]> = {};
  getCourse(s.courseId).modules.forEach((courseModule, n) => {
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
    n < getCourse(s.courseId).modules.length - 1 &&
    isActivityComplete(s, `${getCourse(s.courseId).modules[n].id}:unlock`)
  )
    n++;
  return n;
}
export function phaseComplete(s: LearningState, n: number, phase: string) {
  const activities = getCourse(s.courseId).modules[n]?.phases.find(
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
  // Verification follows the slides in the player. Previously completed practice
  // remains valid; application still requires both practice and verification.
  if (activity.phase === 'verify') return phaseComplete(s, n, 'learn');
  const phaseIndex = PHASES.findIndex((phase) => phase.id === activity.phase);
  return PHASES.slice(0, phaseIndex).every((phase) =>
    phaseComplete(s, n, phase.id),
  );
}
export function canFinish(s: LearningState, n: number) {
  return (
    !!getCourse(s.courseId).modules[n] &&
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
  if (rule.kind === 'checklist')
    return (
      !!rule.checklist?.length &&
      rule.checklist.every((_, i) =>
        (s.activityChecks[activity.id] || []).includes(i),
      )
    );
  if (rule.kind === 'textChecklist')
    return (
      (s.drafts[activity.id] || '').trim().length >= (rule.minLength || 0) &&
      (rule.checklist || []).every((_, i) =>
        (s.activityChecks[activity.id] || []).includes(i),
      )
    );
  if (rule.kind === 'correctAnswer')
    return s.answers[activity.id] === activity.question?.correct;
  if (rule.kind === 'correctSequence')
    return (
      !!activity.interaction &&
      activity.interaction.correct.every(
        (id, i) => s.responses[activity.id]?.[i] === id,
      )
    );
  if (rule.kind === 'examPassed')
    return s.examAttempts.some(
      (attempt) =>
        attempt.submittedAt &&
        examResult(s, attempt).percent >=
          (getCourse(s.courseId).exam?.passPercent || 80),
    );
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
  for (const item of getCourse(s.courseId).achievements) {
    const condition = item.unlockCondition;
    const eligible =
      condition.kind === 'moduleComplete'
        ? isActivityComplete(
            s,
            `${getCourse(s.courseId).modules[condition.module].id}:unlock`,
          )
        : s.streakDays >= condition.days;
    if (eligible && !Object.hasOwn(achievementAwards, item.id))
      achievementAwards[item.id] = { earnedAt: at, source };
  }
  for (const item of getCourse(s.courseId).competencies) {
    const courseModule = getCourse(s.courseId).modules[item.sourceModule];
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
  const activity = getCourse(s.courseId).modules[n]?.activities.find(
    (item) => item.id === id,
  );
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
          evidence: activity.question
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
  completeActivity(s, n, `${getCourse(s.courseId).modules[n]?.id}:unlock`);
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
    s.completed.length !== getCourse(s.courseId).modules.length ||
    Object.keys(s.competencyAwards).length !==
      getCourse(s.courseId).competencies.length ||
    name.length < 3 ||
    !validDate(completionDate) ||
    !new RegExp(
      `^${getCourse(s.courseId).certificatePrefix}-\\d{4}-[A-Z0-9]{8}$`,
    ).test(certificateId)
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
export function restore(
  raw: string,
  courseId = DEFAULT_COURSE_ID,
): LearningState {
  let x: Record<string, unknown>;
  try {
    x = record(JSON.parse(raw));
  } catch {
    return project({ ...initialState, courseId: getCourse(courseId).id });
  }
  if (typeof x.courseId === 'string' && x.courseId !== getCourse(courseId).id)
    return { ...initialState, courseId: getCourse(courseId).id };
  let s: LearningState = {
    ...initialState,
    courseId: getCourse(courseId).id,
    responses: {},
    examAttempts: [],
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
  const legacy =
    x.progressVersion !== 3 && !!getCourse(s.courseId).legacyStorageKey;
  for (const courseModule of getCourse(s.courseId).modules) {
    for (const activity of courseModule.activities) {
      const response = record(x.responses)[activity.id];
      if (Array.isArray(response) && activity.interaction)
        s.responses[activity.id] = response
          .slice(0, activity.interaction.items.length)
          .map((value) => (typeof value === 'string' ? value : ''));
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
    getCourse(s.courseId).modules.forEach((courseModule, n) => {
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
  s.examAttempts = restoreExamAttempts(s, x.examAttempts);
  // Discard inconsistent later-phase records, but retain previously passed legacy verifications
  // while the learner completes the newly introduced practice.
  for (let n = 0; n < getCourse(s.courseId).modules.length; n++) {
    for (const activity of getCourse(s.courseId).modules[n].activities) {
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
  for (const item of getCourse(s.courseId).achievements) {
    const saved = record(record(x.achievementAwards)[item.id]);
    if (Object.keys(saved).length)
      s.achievementAwards[item.id] = {
        earnedAt: validTimestamp(saved.earnedAt) ? saved.earnedAt : null,
        source: saved.source === 'legacy' ? 'legacy' : 'current',
      };
  }
  for (const item of getCourse(s.courseId).competencies) {
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
        Math.min(
          getCourse(s.courseId).modules[s.level].activities.length - 1,
          mappedStep,
        ),
      )
    : 0;
  if (
    !activityAvailable(
      s,
      s.level,
      getCourse(s.courseId).modules[s.level].activities[s.step],
    )
  )
    s.step = getCourse(s.courseId).modules[s.level].activities.findIndex(
      (a) => activityAvailable(s, s.level, a) && !isActivityComplete(s, a.id),
    );
  if (s.step < 0) s.step = 0;
  if (
    s.completed.length === getCourse(s.courseId).modules.length &&
    typeof x.certificateId === 'string' &&
    new RegExp(
      `^${getCourse(s.courseId).certificatePrefix}-\\d{4}-[A-Z0-9]{8}$`,
    ).test(x.certificateId) &&
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

export type ExamAttempt = {
  id: string;
  startedAt: string;
  questionIds: string[];
  answers: Record<string, number>;
  submittedAt: string | null;
};
function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function startExam(
  s: LearningState,
  random = Math.random,
  now = new Date().toISOString(),
): LearningState {
  const exam = getCourse(s.courseId).exam;
  const examModule = getCourse(s.courseId).modules.findIndex((module) =>
    module.activities.some((a) => a.type === 'exam'),
  );
  const activity = getCourse(s.courseId).modules[examModule]?.activities.find(
    (a) => a.type === 'exam',
  );
  if (
    !exam ||
    !activity ||
    !activityAvailable(s, examModule, activity) ||
    s.examAttempts.some((attempt) => !attempt.submittedAt)
  )
    return s;
  const topics = [...new Set(exam.questions.map((q) => q.sourceModule))];
  const selected = topics.flatMap((n) =>
    shuffle(
      exam.questions.filter((q) => q.sourceModule === n),
      random,
    ).slice(0, exam.perTopic),
  );
  const attempt: ExamAttempt = {
    id: `attempt-${now}-${s.examAttempts.length}`,
    startedAt: now,
    questionIds: shuffle(selected, random)
      .slice(0, exam.questionCount)
      .map((q) => q.id),
    answers: {},
    submittedAt: null,
  };
  return { ...s, examAttempts: [...s.examAttempts.slice(-9), attempt] };
}
export function answerExam(
  s: LearningState,
  id: string,
  answer: number,
): LearningState {
  const attempt = s.examAttempts.at(-1),
    q = getCourse(s.courseId).exam?.questions.find((q) => q.id === id);
  if (
    !attempt ||
    attempt.submittedAt ||
    !attempt.questionIds.includes(id) ||
    !q ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer >= q.options.length
  )
    return s;
  return {
    ...s,
    examAttempts: s.examAttempts.map((a) =>
      a === attempt ? { ...a, answers: { ...a.answers, [id]: answer } } : a,
    ),
  };
}
export function examResult(s: LearningState, attempt: ExamAttempt) {
  const questions =
    getCourse(s.courseId).exam?.questions.filter((q) =>
      attempt.questionIds.includes(q.id),
    ) || [];
  const correct = questions.filter(
    (q) => attempt.answers[q.id] === q.correct,
  ).length;
  const topics = [...new Set(questions.map((q) => q.sourceModule))].map(
    (sourceModule) => {
      const items = questions.filter((q) => q.sourceModule === sourceModule);
      const passed = items.filter(
        (q) => attempt.answers[q.id] === q.correct,
      ).length;
      return {
        sourceModule,
        title: getCourse(s.courseId).modules[sourceModule].title,
        correct: passed,
        total: items.length,
        weak: passed < items.length,
      };
    },
  );
  return {
    correct,
    total: questions.length,
    percent: questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0,
    topics,
  };
}
export function submitExam(
  s: LearningState,
  now = new Date().toISOString(),
): LearningState {
  const attempt = s.examAttempts.at(-1),
    exam = getCourse(s.courseId).exam;
  if (
    !exam ||
    !attempt ||
    attempt.submittedAt ||
    attempt.questionIds.length !== exam.questionCount ||
    attempt.questionIds.some((id) => attempt.answers[id] === undefined)
  )
    return s;
  let next = {
    ...s,
    examAttempts: s.examAttempts.map((a) =>
      a === attempt ? { ...a, submittedAt: now } : a,
    ),
  };
  const n = getCourse(s.courseId).modules.findIndex((module) =>
    module.activities.some((a) => a.type === 'exam'),
  );
  const activity = getCourse(s.courseId).modules[n]?.activities.find(
    (a) => a.type === 'exam',
  );
  if (activity) next = completeActivity(next, n, activity.id, now);
  return next;
}
function restoreExamAttempts(s: LearningState, value: unknown): ExamAttempt[] {
  const exam = getCourse(s.courseId).exam;
  if (!exam || !Array.isArray(value)) return [];
  return value
    .slice(-10)
    .flatMap((raw) => {
      const x = record(raw);
      if (
        typeof x.id !== 'string' ||
        !validTimestamp(x.startedAt) ||
        !Array.isArray(x.questionIds)
      )
        return [];
      const ids = x.questionIds.filter(
        (id): id is string =>
          typeof id === 'string' && exam.questions.some((q) => q.id === id),
      );
      if (ids.length !== exam.questionCount || new Set(ids).size !== ids.length)
        return [];
      const answers: Record<string, number> = {};
      for (const id of ids) {
        const q = exam.questions.find((q) => q.id === id)!;
        const answer = record(x.answers)[id];
        if (
          Number.isInteger(answer) &&
          Number(answer) >= 0 &&
          Number(answer) < q.options.length
        )
          answers[id] = Number(answer);
      }
      const submittedAt =
        validTimestamp(x.submittedAt) &&
        ids.every((id) => answers[id] !== undefined)
          ? x.submittedAt
          : null;
      return [
        {
          id: x.id.slice(0, 150),
          startedAt: x.startedAt,
          questionIds: ids,
          answers,
          submittedAt,
        },
      ];
    })
    .filter(
      (attempt, index, array) =>
        attempt.submittedAt || index === array.length - 1,
    );
}

/** Confirm one micro-lesson and advance atomically, including the phase boundary. */
export function continueMicroLesson(
  s: LearningState,
  moduleIndex: number,
  activityId: string,
  now = new Date().toISOString(),
): LearningState {
  const activities = getCourse(s.courseId).modules[moduleIndex]?.activities;
  const index = activities?.findIndex((a) => a.id === activityId) ?? -1;
  if (
    !activities ||
    index < 0 ||
    activities[index].type !== 'microLesson' ||
    s.level !== moduleIndex ||
    s.step !== index
  )
    return s;
  const next = completeActivity(s, moduleIndex, activityId, now);
  if (!isActivityComplete(next, activityId)) return s;
  const ordered = lessonActivities(activities);
  const position = ordered.findIndex((a) => a.id === activityId);
  const following = ordered[position + 1];
  return { ...next, step: following ? activities.indexOf(following) : index };
}
