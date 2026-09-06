import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  completeActivity,
  canFinish,
  canCompleteActivity,
  activityAvailable,
  setDraft,
  score,
  unlock,
  restore,
  serialize,
  completionPercent,
  issueCertificate,
  touchStudy,
  completedActivityCount,
} from '../app/progress.ts';
import {
  courseModules,
  PHASES,
  COURSE_ACTIVITY_COUNT,
  COURSE_XP,
  competencyDefinitions,
} from '../app/learning-model.ts';
import { learningLevel, XP_REWARDS } from '../app/learning-config.ts';
import { achievements } from '../app/achievements.ts';
const now = '2026-09-06T12:00:00.000Z';
export function prepareActivity(s, activity) {
  if (activity.question)
    s = {
      ...s,
      answers: { ...s.answers, [activity.id]: activity.question.correct },
    };
  if (activity.completionRule.kind === 'textChecklist') {
    s = setDraft(
      s,
      activity.id,
      'Una richiesta con obiettivo, contesto e formato. Controllerò i fatti prima di usare il risultato.',
    );
    s = {
      ...s,
      activityChecks: {
        ...s.activityChecks,
        [activity.id]: activity.completionRule.checklist.map((_, i) => i),
      },
    };
  }
  return s;
}
export function finishModule(s, n) {
  for (const activity of courseModules[n].activities)
    s = completeActivity(prepareActivity(s, activity), n, activity.id, now);
  return s;
}
const finishCourse = () =>
  courseModules.reduce((s, _, n) => finishModule(s, n), initialState);
function legacyState(count = 1) {
  return {
    level: Math.min(count, 5),
    step: 0,
    seen: Array.from({ length: count }, (_, n) =>
      [0, 1, 2].map((i) => `${n}:${i}`),
    ).flat(),
    solved: Array.from({ length: count }, (_, n) =>
      [0, 1, 2].map((i) => `${n}:${i}`),
    ).flat(),
    completed: Array.from({ length: count }, (_, n) => n),
    notes: { 0: 'Elaborato originale da preservare durante la migrazione.' },
    checks: { 0: [0, 1, 2] },
    profileName: 'Luca Bianchi',
    streakDays: 3,
    lastStudyDate: '2026-09-05',
    certificateId: count === 6 ? 'PAI-2026-A1B2C3D4' : '',
    completionDate: count === 6 ? '2026-09-05' : '',
  };
}
test('Every module uses the five phases with stable distinct activities and transparent rules', () => {
  assert.equal(courseModules.length, 6);
  assert.equal(COURSE_ACTIVITY_COUNT, 54);
  assert.equal(COURSE_XP, 1350);
  const ids = new Set();
  for (const module of courseModules) {
    assert.deepEqual(
      module.phases.map((p) => p.id),
      PHASES.map((p) => p.id),
    );
    assert.deepEqual(
      module.phases.map((p) => p.activities.length),
      [3, 1, 3, 1, 1],
    );
    for (const a of module.activities) {
      assert.ok(!ids.has(a.id));
      ids.add(a.id);
      assert.ok(a.title && a.description && a.completionRule);
    }
  }
});
test('Opening content does not award XP or study days; later phases and modules are locked', () => {
  assert.equal(score(initialState), 0);
  assert.equal(initialState.streakDays, 0);
  assert.equal(completionPercent(initialState), 0);
  for (const index of [3, 4, 7, 8])
    assert.equal(
      activityAvailable(initialState, 0, courseModules[0].activities[index]),
      false,
    );
  assert.equal(
    completeActivity(initialState, 1, courseModules[1].activities[0].id),
    initialState,
  );
});
test('Practice requires learn, a saved draft and an explicit checklist; no fake semantic grade', () => {
  let s = initialState;
  for (const a of courseModules[0].phases[0].activities)
    s = completeActivity(s, 0, a.id, now);
  assert.equal(score(s), 15);
  const practice = courseModules[0].activities[3];
  assert.equal(canCompleteActivity(s, 0, practice), false);
  s = setDraft(
    s,
    practice.id,
    'Una richiesta abbastanza lunga da passare il controllo della lunghezza.',
  );
  assert.equal(canCompleteActivity(s, 0, practice), false);
  s = { ...s, activityChecks: { [practice.id]: [0] } };
  s = completeActivity(s, 0, practice.id, now);
  assert.equal(score(s), 35);
});
test('Wrong verification earns no XP; correct verification remains idempotent', () => {
  let s = initialState;
  for (const a of courseModules[0].activities.slice(0, 4))
    s = completeActivity(prepareActivity(s, a), 0, a.id, now);
  const a = courseModules[0].activities[4];
  s = { ...s, answers: { [a.id]: 1 - a.question.correct } };
  assert.equal(score(completeActivity(s, 0, a.id, now)), 35);
  s = completeActivity(prepareActivity(s, a), 0, a.id, now);
  assert.equal(score(s), 65);
  assert.equal(score(completeActivity(s, 0, a.id, now)), 65);
});
test('No module reward, achievement or competency until application and unlock are complete', () => {
  let s = initialState;
  for (const a of courseModules[0].activities.slice(0, 7))
    s = completeActivity(prepareActivity(s, a), 0, a.id, now);
  assert.equal(canFinish(s, 0), false);
  assert.equal(Object.keys(s.competencyAwards).length, 0);
  assert.equal(achievements[0].earned(s), false);
  const apply = courseModules[0].activities[7];
  s = completeActivity(prepareActivity(s, apply), 0, apply.id, now);
  assert.equal(canFinish(s, 0), true);
  assert.equal(achievements[0].earned(s), false);
  s = completeActivity(s, 0, courseModules[0].activities[8].id, now);
  assert.equal(score(s), 225);
  assert.equal(unlock(s), 1);
  assert.ok(s.achievementAwards['signal-frame']);
  assert.ok(s.competencyAwards['fundamental-prompting']);
  assert.equal(
    s.competencyAwards['fundamental-prompting'].evidence,
    s.drafts[apply.id],
  );
  assert.equal(s.competencyAwards['fundamental-prompting'].acquiredAt, now);
});
test('Replaying, double completion and note edits never farm XP or erase earned evidence', () => {
  let s = finishModule(initialState, 0);
  const original = s.competencyAwards['fundamental-prompting'].evidence;
  s = setDraft(s, 'module-1:apply', '');
  s = { ...s, activityChecks: {} };
  assert.equal(score(s), 225);
  s = restore(serialize(s));
  assert.equal(score(s), 225);
  assert.equal(s.competencyAwards['fundamental-prompting'].evidence, original);
  for (const a of courseModules[0].activities)
    s = completeActivity(prepareActivity(s, a), 0, a.id, now);
  assert.equal(score(s), 225);
  assert.equal(Object.keys(s.achievementAwards).length, 1);
});
test('XP levels are derived at every threshold and handle the final rank', () => {
  for (const [xp, rank] of [
    [0, 1],
    [149, 1],
    [150, 2],
    [449, 2],
    [450, 3],
    [749, 3],
    [750, 4],
    [1049, 4],
    [1050, 5],
    [1350, 5],
  ])
    assert.equal(learningLevel(xp).current.level, rank);
  assert.equal(learningLevel(120).remaining, 30);
  assert.equal(learningLevel(1350).next, undefined);
  assert.equal(XP_REWARDS.verification, 30);
});
test('The full course earns exactly 1350 XP, 6 competencies, 54 activities and a stable certificate', () => {
  const s = finishCourse();
  assert.equal(score(s), 1350);
  assert.equal(completionPercent(s), 100);
  assert.equal(completedActivityCount(s), 54);
  assert.equal(Object.keys(s.competencyAwards).length, 6);
  assert.deepEqual(restore(serialize(s)), s);
  assert.equal(
    issueCertificate(initialState, 'Luca', '2026-09-06', 'PAI-2026-A1B2C3D4')
      .certificateId,
    '',
  );
  assert.equal(
    issueCertificate(s, 'Lu', '2026-09-06', 'PAI-2026-A1B2C3D4').certificateId,
    '',
  );
  const cert = issueCertificate(
    s,
    'Luca Bianchi',
    '2026-09-06',
    'PAI-2026-A1B2C3D4',
  );
  assert.equal(cert.certificateId, 'PAI-2026-A1B2C3D4');
  assert.equal(
    issueCertificate(cert, 'Altro Nome', '2026-09-07', 'PAI-2026-EEEEEEEE')
      .certificateId,
    cert.certificateId,
  );
});
test('Drafts, checks and a selected answer survive refresh before completion', () => {
  const s = {
    ...setDraft(
      initialState,
      'module-1:practice',
      'Una bozza locale ancora da confermare.',
    ),
    activityChecks: { 'module-1:practice': [0] },
    answers: { 'module-1:verify-1': 0 },
    step: 1,
  };
  const result = restore(serialize(s));
  assert.equal(
    result.drafts['module-1:practice'],
    s.drafts['module-1:practice'],
  );
  assert.deepEqual(result.answers, s.answers);
  assert.deepEqual(result.activityChecks, s.activityChecks);
  assert.equal(score(result), 0);
});
test('Legacy completed modules retain exact XP, notes, awards and explicit exemptions without inventing dates', () => {
  const result = restore(JSON.stringify(legacyState()));
  assert.equal(result.progressVersion, 3);
  assert.equal(score(result), 100);
  assert.equal(unlock(result), 1);
  assert.equal(
    result.completedActivities['module-1:practice'].source,
    'exemption',
  );
  assert.equal(result.notes[0], legacyState().notes[0]);
  assert.equal(result.achievementAwards['signal-frame'].earnedAt, null);
  assert.equal(
    result.competencyAwards['fundamental-prompting'].acquiredAt,
    null,
  );
  assert.deepEqual(restore(serialize(result)), result);
});
test('Legacy partial work preserves correct answers but introduces practice as a real missing prerequisite', () => {
  const result = restore(
    JSON.stringify({
      ...legacyState(0),
      seen: ['0:0', '0:1', '0:2'],
      solved: ['0:0'],
      step: 3,
    }),
  );
  assert.equal(score(result), 20);
  assert.equal(result.step, 3);
  assert.equal(result.completedActivities['module-1:practice'], undefined);
  assert.equal(result.achievementAwards['signal-frame'].source, 'legacy');
  assert.equal(Object.keys(result.competencyAwards).length, 0);
});
test('A completed legacy course keeps 600 XP, 100% and its existing certificate', () => {
  const result = restore(JSON.stringify(legacyState(6)));
  assert.equal(score(result), 600);
  assert.equal(completionPercent(result), 100);
  assert.equal(result.certificateId, 'PAI-2026-A1B2C3D4');
  assert.equal(
    Object.keys(result.competencyAwards).length,
    competencyDefinitions.length,
  );
});
test('Corrupt and partial storage never crashes; invalid ids and impossible module unlocks are discarded', () => {
  for (const raw of [
    'broken',
    'null',
    '[]',
    '{"completedActivities":null}',
    '{"progressVersion":3,"answers":4,"drafts":[]}',
  ])
    assert.doesNotThrow(() => restore(raw));
  const s = restore(
    JSON.stringify({
      progressVersion: 3,
      level: 999,
      step: -5,
      completedActivities: {
        garbage: { xp: 1e10 },
        'module-6:unlock': { xp: 1000, source: 'current' },
      },
    }),
  );
  assert.equal(score(s), 0);
  assert.equal(s.level, 0);
  assert.equal(s.step, 0);
});
test('Streak is recorded once per study day and earned Momentum Orbit survives a later break', () => {
  let s = touchStudy(initialState, '2026-09-04');
  s = touchStudy(s, '2026-09-04');
  assert.equal(s.streakDays, 1);
  s = touchStudy(s, '2026-09-05');
  s = completeActivity(s, 0, 'module-1:learn-1', now);
  assert.equal(s.streakDays, 3);
  assert.ok(s.achievementAwards['momentum-orbit']);
  s = touchStudy(s, '2026-09-10');
  assert.equal(s.streakDays, 1);
  s = restore(serialize(s));
  assert.ok(s.achievementAwards['momentum-orbit']);
});

test('An explicit review can maintain the study streak without new XP or changing acquired dates', () => {
  const first = finishModule(initialState, 0);
  const date = first.competencyAwards['fundamental-prompting'].acquiredAt;
  const reviewed = completeActivity(
    first,
    0,
    'module-1:learn-1',
    '2026-09-07T12:00:00.000Z',
  );
  assert.equal(score(reviewed), 225);
  assert.equal(reviewed.streakDays, 2);
  assert.equal(
    reviewed.competencyAwards['fundamental-prompting'].acquiredAt,
    date,
  );
});
test('Malformed completion objects are not converted to paid activity completions', () => {
  const result = restore(
    JSON.stringify({
      progressVersion: 3,
      completedActivities: { 'module-1:learn-1': { foo: true } },
    }),
  );
  assert.equal(score(result), 0);
  assert.equal(completedActivityCount(result), 0);
});
