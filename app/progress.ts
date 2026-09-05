export type LearningState = {
  level: number;
  step: number;
  seen: string[];
  solved: string[];
  completed: number[];
  notes: Record<string, string>;
  checks: Record<string, number[]>;
  streakDays: number;
  lastStudyDate: string;
  profileName: string;
  certificateId: string;
  completionDate: string;
};
export const initialState: LearningState = {
  level: 0,
  step: 0,
  seen: [],
  solved: [],
  completed: [],
  notes: {},
  checks: {},
  streakDays: 0,
  lastStudyDate: '',
  profileName: '',
  certificateId: '',
  completionDate: '',
};
export const keyFor = (level: number, item: number) => `${level}:${item}`;
export function score(s: LearningState) {
  return s.solved.length * 20 + s.completed.length * 40;
}
export function completionPercent(s: LearningState) {
  return Math.round(
    ((s.seen.length + s.solved.length + s.completed.length) / 42) * 100,
  );
}
export function touchStudy(s: LearningState, today: string): LearningState {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || s.lastStudyDate === today) return s;
  const current = Date.parse(`${today}T00:00:00Z`);
  const previous = /^\d{4}-\d{2}-\d{2}$/.test(s.lastStudyDate)
    ? Date.parse(`${s.lastStudyDate}T00:00:00Z`)
    : Number.NaN;
  const consecutive =
    Number.isFinite(previous) && current - previous === 86400000;
  return {
    ...s,
    streakDays: consecutive ? Math.max(1, s.streakDays) + 1 : 1,
    lastStudyDate: today,
  };
}
export function unlock(s: LearningState) {
  let n = 0;
  while (n < 5 && s.completed.includes(n)) n++;
  return n;
}
export function award(s: LearningState, id: string): LearningState {
  return { ...s, solved: [...new Set([...s.solved, id])] };
}
export function canFinish(s: LearningState, n: number) {
  return (
    [0, 1, 2].every(
      (i) => s.seen.includes(keyFor(n, i)) && s.solved.includes(keyFor(n, i)),
    ) &&
    (s.notes[n] || '').trim().length >= 30 &&
    [0, 1, 2].every((i) => (s.checks[n] || []).includes(i))
  );
}
export function complete(s: LearningState, n: number) {
  if (!Number.isInteger(n) || n < 0 || n > unlock(s) || !canFinish(s, n))
    return s;
  return { ...s, completed: [...new Set([...s.completed, n])] };
}
export function issueCertificate(
  s: LearningState,
  profileName: string,
  completionDate: string,
  certificateId: string,
) {
  const name = profileName.trim().replace(/\s+/g, ' ').slice(0, 80);
  if (
    s.completed.length !== 6 ||
    name.length < 3 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(completionDate) ||
    !/^PAI-\d{4}-[A-Z0-9]{8}$/.test(certificateId)
  )
    return s;
  return { ...s, profileName: name, completionDate, certificateId };
}
export function restore(raw: string): LearningState {
  const x = JSON.parse(raw);
  if (!x || typeof x !== 'object') return { ...initialState };
  const valid = (a: unknown): string[] =>
    Array.isArray(a)
      ? [
          ...new Set(
            a.filter(
              (v): v is string =>
                typeof v === 'string' && /^[0-5]:[0-2]$/.test(v),
            ),
          ),
        ]
      : [];
  const notes: Record<string, string> = {},
    checks: Record<string, number[]> = {};
  for (let n = 0; n < 6; n++) {
    if (typeof x.notes?.[n] === 'string') notes[n] = x.notes[n].slice(0, 20000);
    if (Array.isArray(x.checks?.[n]))
      checks[n] = [
        ...new Set<number>(
          x.checks[n].filter((v: unknown) => v === 0 || v === 1 || v === 2),
        ),
      ];
  }
  const s: LearningState = {
    ...initialState,
    seen: valid(x.seen),
    solved: valid(x.solved),
    notes,
    checks,
    completed: [],
    streakDays:
      Number.isInteger(x.streakDays) && x.streakDays > 0
        ? Math.min(x.streakDays, 3650)
        : 0,
    lastStudyDate:
      typeof x.lastStudyDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(x.lastStudyDate)
        ? x.lastStudyDate
        : '',
    profileName:
      typeof x.profileName === 'string'
        ? x.profileName.trim().replace(/\s+/g, ' ').slice(0, 80)
        : '',
    certificateId:
      typeof x.certificateId === 'string' &&
      /^PAI-\d{4}-[A-Z0-9]{8}$/.test(x.certificateId)
        ? x.certificateId
        : '',
    completionDate:
      typeof x.completionDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(x.completionDate)
        ? x.completionDate
        : '',
  };
  for (let n = 0; n < 6; n++) {
    if (
      Array.isArray(x.completed) &&
      x.completed.includes(n) &&
      [0, 1, 2].every(
        (i) => s.seen.includes(keyFor(n, i)) && s.solved.includes(keyFor(n, i)),
      )
    )
      s.completed.push(n);
    else break;
  }
  s.level = Number.isInteger(x.level)
    ? Math.max(0, Math.min(unlock(s), x.level))
    : 0;
  s.step = Number.isInteger(x.step) ? Math.max(0, Math.min(6, x.step)) : 0;
  return s;
}
