import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  courses,
  getCourse,
  courseActivityCount,
  courseXp,
} from '../app/courses.ts';
import {
  restore,
  serialize,
  completeActivity,
  setDraft,
  score,
  startExam,
  answerExam,
  submitExam,
  examResult,
  completionPercent,
  issueCertificate,
} from '../app/progress.ts';
const ads = getCourse('google-ads');
const fresh = () => restore('{}', ads.id);
export function prepared(s, a) {
  if (a.question)
    s = { ...s, answers: { ...s.answers, [a.id]: a.question.correct } };
  if (a.interaction)
    s = { ...s, responses: { ...s.responses, [a.id]: a.interaction.correct } };
  if (a.completionRule.kind === 'textChecklist') {
    s = setDraft(
      s,
      a.id,
      'Definisco un obiettivo misurabile, verifico conversioni e dati, confronto i risultati e rialloco il budget solo dopo un controllo documentato.',
    );
    s = {
      ...s,
      activityChecks: {
        ...s.activityChecks,
        [a.id]: a.completionRule.checklist.map((_, i) => i),
      },
    };
  }
  return s;
}
export function examReady() {
  let s = fresh();
  for (let n = 0; n < 7; n++)
    for (const a of ads.modules[n].activities) {
      if (a.type === 'exam') return { ...s, level: n, step: 4 };
      s = completeActivity(prepared(s, a), n, a.id);
    }
  return s;
}
export function answered(s, correct = true) {
  for (const id of s.examAttempts.at(-1).questionIds) {
    const q = ads.exam.questions.find((q) => q.id === id);
    s = answerExam(
      s,
      id,
      correct ? q.correct : (q.correct + 1) % q.options.length,
    );
  }
  return s;
}
export function adsFinished() {
  let s = submitExam(answered(startExam(examReady())));
  for (const a of ads.modules[6].activities.slice(5))
    s = completeActivity(prepared(s, a), 6, a.id);
  return s;
}
test('Registry has independent courses, unique activity ids and seven complete Ads modules', () => {
  assert.equal(courses.length, 2);
  assert.equal(ads.id, 'google-ads');
  assert.equal(ads.modules.length, 7);
  assert.equal(courseActivityCount(ads.id), 61);
  assert.equal(courseXp(ads.id), 1515);
  const ids = courses.flatMap((c) =>
    c.modules.flatMap((m) => m.activities.map((a) => a.id)),
  );
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(
    ads.modules.flatMap((m) => m.activities).some((a) => a.type === 'matching'),
  );
  assert.ok(
    ads.modules.flatMap((m) => m.activities).some((a) => a.type === 'ordering'),
  );
});
test('Course restoration rejects foreign records and never imports AI legacy into Ads', () => {
  const ai = restore('{}');
  const original = serialize(ai);
  const s = examReady();
  assert.equal(serialize(ai), original);
  assert.equal(score(restore(serialize(s))), 0);
  assert.equal(score(restore(original, ads.id)), 0);
  assert.equal(
    score(restore(JSON.stringify({ seen: ['0:0'], completed: [0] }), ads.id)),
    0,
  );
  assert.notEqual(ads.storageKey, courses[0].storageKey);
});
test('Exam locks until studied, samples two per topic, and resumes exact unanswered attempt', () => {
  assert.equal(startExam(fresh()).examAttempts.length, 0);
  let s = startExam(examReady(), () => 0.37);
  const attempt = s.examAttempts[0];
  assert.equal(new Set(attempt.questionIds).size, 12);
  for (let n = 0; n < 6; n++)
    assert.equal(
      attempt.questionIds.filter(
        (id) => ads.exam.questions.find((q) => q.id === id).sourceModule === n,
      ).length,
      2,
    );
  s = answerExam(s, attempt.questionIds[0], 0);
  assert.deepEqual(restore(serialize(s), ads.id).examAttempts, s.examAttempts);
  assert.equal(startExam(s), s);
  assert.equal(submitExam(s), s);
});
test('Wrong exam has no XP, reveals weak topics; passing and retries award only once', () => {
  let s = startExam(examReady());
  const before = score(s);
  s = submitExam(answered(s, false));
  assert.equal(examResult(s, s.examAttempts.at(-1)).percent, 0);
  assert.equal(
    examResult(s, s.examAttempts.at(-1)).topics.filter((t) => t.weak).length,
    6,
  );
  assert.equal(score(s), before);
  assert.equal(answerExam(s, s.examAttempts.at(-1).questionIds[0], 0), s);
  s = submitExam(answered(startExam(s)));
  assert.equal(score(s), before + 30);
  assert.equal(examResult(s, s.examAttempts.at(-1)).percent, 100);
  s = submitExam(answered(startExam(s)));
  assert.equal(score(s), before + 30);
  assert.deepEqual(restore(serialize(s), ads.id).examAttempts, s.examAttempts);
});
test('Full Ads course earns independent XP, skills, achievements and certificate', () => {
  const s = adsFinished();
  assert.equal(score(s), 1515);
  assert.equal(completionPercent(s), 100);
  assert.equal(Object.keys(s.competencyAwards).length, 7);
  assert.equal(Object.keys(s.achievementAwards).length, 6);
  const cert = issueCertificate(
    s,
    'Test Academy',
    '2026-09-07',
    'ADS-2026-A1B2C3D4',
  );
  assert.equal(cert.certificateId, 'ADS-2026-A1B2C3D4');
  assert.equal(score(restore(serialize(cert), ads.id)), 1515);
});
test('Malformed exam attempts are discarded without crashing', () => {
  for (const examAttempts of [
    null,
    4,
    [{}],
    [
      {
        id: 'bad',
        startedAt: '2026-09-07T12:00:00Z',
        questionIds: ['unknown'],
      },
    ],
  ]) {
    const s = restore(JSON.stringify({ ...fresh(), examAttempts }), ads.id);
    assert.deepEqual(s.examAttempts, []);
  }
});

test('One Continue confirms a micro-lesson, awards XP, advances phases, and ignores duplicate stale clicks', async () => {
  const { continueMicroLesson } = await import('../app/progress.ts');
  for (const course of courses) {
    let s = restore('{}', course.id);
    const activities = course.modules[0].activities;
    for (let i = 0; i < 3; i++) {
      const id = activities[i].id;
      s = continueMicroLesson(s, 0, id);
      assert.equal(s.step, i + 1);
      assert.equal(score(s), (i + 1) * 5);
      assert.equal(continueMicroLesson(s, 0, id), s);
    }
    assert.equal(s.step, 3);
    assert.equal(continueMicroLesson(s, 0, activities[3].id), s);
    s = { ...s, step: 0 };
    s = continueMicroLesson(s, 0, activities[0].id);
    assert.equal(s.step, 1);
    assert.equal(score(s), 15);
    assert.equal(restore(serialize(s), course.id).step, 1);
  }
});
