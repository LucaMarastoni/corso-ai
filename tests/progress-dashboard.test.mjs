import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courses, getCourse } from '../app/courses.ts';
import { completeActivity, restore, score, completionPercent, serialize, touchStudy } from '../app/progress.ts';
import { progressDashboard, progressActivity, localDay } from '../app/progress-dashboard.ts';
import { learningLevel } from '../app/learning-config.ts';

const now = new Date('2026-09-09T12:00:00Z');
const fresh = () => courses.map(c => restore('{}', c.id));
const ai = getCourse('ai-basics');
const ads = getCourse('google-ads');
function finishFirstLesson(state, at = '2026-09-07T12:00:00Z') {
  return completeActivity(state, 0, getCourse(state.courseId).modules[0].activities[0].id, at);
}

test('Empty ledgers stay empty and never use illustrative XP, completion or quiz accuracy', () => {
  const data = progressDashboard(fresh(), ai.id, now);
  assert.equal(data.xp, 0);
  assert.equal(data.percent, 0);
  assert.equal(data.started, 0);
  assert.equal(data.completed, 0);
  assert.equal(data.accuracy, null);
  assert.equal(data.streak, 0);
  assert.equal(data.monthlyChange, null);
  assert.equal(data.modulesTotal, 13);
  assert.equal(data.milestone.name, 'Signal Frame');
  assert.equal(data.milestone.done, 0);
  assert.equal(data.milestone.xp, ai.modules[0].activities.reduce((sum, a) => sum + a.xpReward, 0));
  assert.ok(data.skills.every(s => s.percent === 0));
});

test('Projection combines both canonical course ledgers without mutation or double counting', () => {
  const states = fresh().map(s => finishFirstLesson(s));
  const before = states.map(serialize);
  const data = progressDashboard(states, ai.id, now);
  assert.equal(data.xp, states.reduce((sum, s) => sum + score(s), 0));
  assert.equal(data.percent, Math.round(states.reduce((sum, s) => sum + completionPercent(s), 0) / states.length));
  assert.equal(data.started, 2);
  assert.equal(data.week.reduce((sum, d) => sum + d.lessons, 0), 2);
  assert.equal(data.streak, 0); // Monday's study does not keep a streak alive on Wednesday.
  assert.equal(data.recordStreak, 1);
  assert.deepEqual(data.level, learningLevel(data.xp));
  assert.deepEqual(states.map(serialize), before);
});

test('Local calendar boundaries keep dated activity in the right week and month', () => {
  const states = fresh();
  const localNow = new Date(2026, 8, 9, 12);
  let state = finishFirstLesson(states[0], new Date(2026, 7, 31, 23, 30).toISOString());
  state = completeActivity(state, 0, ai.modules[0].activities[1].id, new Date(2026, 8, 1, 0, 30).toISOString());
  state = completeActivity(state, 0, ai.modules[0].activities[2].id, new Date(2026, 8, 7, 0, 30).toISOString());
  const data = progressDashboard([state, states[1]], ai.id, localNow);
  assert.equal(data.monthlyLessons, 2);
  assert.equal(data.monthlyChange, 100);
  assert.equal(data.week[0].day, '2026-09-07');
  assert.equal(data.week[0].lessons, 1);
  assert.equal(data.week[3].future, true);
  assert.equal(localDay(localNow), '2026-09-09');
});

test('Legacy completions contribute to totals without invented study dates', () => {
  const states = fresh();
  const s = finishFirstLesson(states[0]);
  const id = ai.modules[0].activities[0].id;
  s.completedActivities[id] = { ...s.completedActivities[id], completedAt: null, source: 'legacy' };
  s.lastStudyDate = '';
  s.streakDays = 0;
  const data = progressDashboard([s, states[1]], ai.id, now);
  assert.equal(data.started, 1);
  assert.ok(data.percent > 0);
  assert.equal(data.monthlyLessons, 0);
  assert.equal(data.week.reduce((sum, d) => sum + d.activities, 0), 0);
  assert.equal(data.hasUndatedActivities, true);
});

test('Review-only days from the saved streak merge across courses and expire correctly', () => {
  const states = fresh();
  states[0] = touchStudy(touchStudy(states[0], '2026-09-07'), '2026-09-08');
  states[1] = touchStudy(states[1], '2026-09-09');
  const data = progressDashboard(states, ai.id, now);
  assert.equal(data.streak, 3);
  assert.equal(data.recordStreak, 3);
  assert.deepEqual(data.week.slice(0, 3).map(d => d.studied), [true, true, true]);
  assert.equal(data.week.reduce((sum, d) => sum + d.lessons, 0), 0);
  assert.equal(progressDashboard(states, ai.id, new Date('2026-09-11T12:00:00Z')).streak, 0);
});

test('Resume chooses available unfinished work and review rejects locked, foreign or unknown activities', () => {
  let state = fresh()[0];
  assert.equal(progressActivity(state).activity.id, ai.modules[0].activities[0].id);
  state = finishFirstLesson(state);
  assert.equal(progressActivity(state).activity.id, ai.modules[0].activities[1].id);
  assert.equal(progressActivity(state, ai.modules[0].activities[0].id).moduleIndex, 0);
  assert.equal(progressActivity(state, ai.modules[3].activities[0].id), null);
  assert.equal(progressActivity(state, ads.modules[0].activities[0].id), null);
  assert.equal(progressActivity(state, 'not-an-activity'), null);
});

test('Quiz performance uses saved answers and review targets the corresponding available module', () => {
  const states = fresh();
  const questions = ai.modules[0].activities.filter(a => a.question);
  const answers = Object.fromEntries(questions.map((a, index) => [a.id, index ? a.question.correct : (a.question.correct + 1) % a.question.options.length]));
  states[0] = { ...states[0], answers };
  const data = progressDashboard(states, ai.id, now);
  assert.equal(data.accuracy, Math.round((questions.length - 1) / questions.length * 100));
  assert.equal(data.reviews.length, 1);
  assert.equal(data.reviews[0].moduleIndex, 0);
  assert.equal(data.reviews[0].courseId, ai.id);
  assert.equal(data.reviews[0].activityId, ai.modules[0].activities[0].id);
  assert.equal(data.week.reduce((sum, d) => sum + d.quizzes, 0), 0);
});

test('Repeated exam attempts use the latest submitted result, not an unfinished attempt', () => {
  const states = fresh();
  const q = ads.exam.questions[0];
  states[1] = { ...states[1], examAttempts: [
    { id: 'old', startedAt: '2026-09-07T09:00:00Z', submittedAt: '2026-09-07T10:00:00Z', questionIds: [q.id], answers: { [q.id]: (q.correct + 1) % q.options.length } },
    { id: 'latest', startedAt: '2026-09-08T09:00:00Z', submittedAt: '2026-09-08T10:00:00Z', questionIds: [q.id], answers: { [q.id]: q.correct } },
    { id: 'draft', startedAt: '2026-09-09T09:00:00Z', submittedAt: null, questionIds: [q.id], answers: {} },
  ] };
  const data = progressDashboard(states, ads.id, now);
  assert.equal(data.accuracy, 100);
  assert.equal(data.reviews.length, 0);
});
