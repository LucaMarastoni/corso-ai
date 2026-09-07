import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courses, getCourse, courseXp } from '../app/courses.ts';
import { lessonActivities } from '../app/learning-model.ts';
import { introSlides } from '../app/lesson-content.ts';
import {
  activityKind,
  lessonPosition,
  advanceLesson,
  slideSwipe,
} from '../app/lesson-player-model.ts';
import { progressActivity } from '../app/progress-dashboard.ts';
import {
  restore,
  serialize,
  score,
  canFinish,
  canCompleteActivity,
  completeActivity,
  startExam,
  answerExam,
  submitExam,
  completionPercent,
  activityAvailable,
} from '../app/progress.ts';
const at = '2026-09-08T12:00:00Z';
function prepare(state, activity) {
  if (activity.question)
    state = {
      ...state,
      answers: { ...state.answers, [activity.id]: activity.question.correct },
    };
  if (activity.interaction)
    state = {
      ...state,
      responses: {
        ...state.responses,
        [activity.id]: activity.interaction.correct,
      },
    };
  if (activity.completionRule.kind === 'textChecklist')
    state = {
      ...state,
      drafts: {
        ...state.drafts,
        [activity.id]:
          'Preparo una richiesta con un obiettivo misurabile, fatti disponibili, vincoli e formato. Controllo le informazioni e valuto il risultato prima di usarlo.',
      },
      activityChecks: {
        ...state.activityChecks,
        [activity.id]: activity.completionRule.checklist.map((_, i) => i),
      },
    };
  if (activity.type === 'exam') {
    state = startExam(state, () => 0.4, at);
    for (const id of state.examAttempts.at(-1).questionIds) {
      const question = getCourse(state.courseId).exam.questions.find(
        (q) => q.id === id,
      );
      state = answerExam(state, id, question.correct);
    }
    state = submitExam(state, at);
  }
  return state;
}
test('Reference slides use three data-driven templates and retain established lesson identifiers', () => {
  assert.deepEqual(
    introSlides.map((s) => s.layout),
    ['concept', 'process', 'comparison'],
  );
  const slides = getCourse('ai-basics').modules[0].activities.filter(
    (a) => a.slide,
  );
  assert.deepEqual(
    slides.map((s) => s.id),
    ['module-1:learn-1', 'module-1:learn-2', 'module-1:learn-3'],
  );
  assert.ok(slides.every((s) => activityKind(s) === 'slide'));
});
test('Three Continue actions enter verification, preserving numeric save indexes and awarding 15 XP once', () => {
  for (const course of courses) {
    let state = restore('{}', course.id);
    const module = course.modules[0];
    for (let i = 0; i < 3; i++) {
      const id = module.activities[state.step].id;
      state = advanceLesson(state, 0, id, at);
      assert.equal(score(state), (i + 1) * 5);
      assert.equal(advanceLesson(state, 0, id, at), state);
    }
    assert.equal(module.activities[state.step].phase, 'verify');
    assert.equal(state.completedActivities[`${module.id}:practice`], undefined);
    assert.equal(lessonPosition(state).current, 1);
    assert.equal(restore(serialize(state), course.id).step, state.step);
  }
});
test('Wrong answers cannot complete or advance; saved correct answers require explicit validation', () => {
  let state = restore('{}');
  for (let i = 0; i < 3; i++)
    state = advanceLesson(
      state,
      0,
      getCourse().modules[0].activities[state.step].id,
      at,
    );
  const activity = lessonPosition(state).activity;
  state = {
    ...state,
    answers: { [activity.id]: 1 - activity.question.correct },
  };
  assert.equal(advanceLesson(state, 0, activity.id, at), state);
  assert.equal(score(state), 15);
  state = prepare(state, activity);
  state = restore(serialize(state));
  assert.equal(state.completedActivities[activity.id], undefined);
  const checked = completeActivity(state, 0, activity.id, at);
  assert.equal(checked.step, state.step); // Inline feedback precedes Continue.
  assert.equal(score(checked), 45);
  const next = advanceLesson(checked, 0, activity.id, at);
  assert.equal(score(next), 45);
  assert.equal(lessonPosition(next).current, 2);
});
test('Both courses complete in slide → quiz → practice → application → completion order and restore at every step', () => {
  for (const course of courses) {
    let state = restore('{}', course.id);
    for (const [n, module] of course.modules.entries()) {
      state = { ...state, level: n, step: 0 };
      for (const activity of lessonActivities(module.activities)) {
        assert.equal(module.activities[state.step].id, activity.id);
        assert.equal(activityAvailable(state, n, activity), true);
        state = prepare(state, activity);
        state = advanceLesson(state, n, activity.id, at);
        const persisted = restore(serialize(state), course.id);
        assert.equal(
          score(persisted),
          score(state),
          `${activity.id}: earned XP must survive reload`,
        );
        assert.equal(persisted.step, state.step);
        state = persisted;
      }
      assert.equal(canFinish(state, n), true);
    }
    assert.equal(completionPercent(state), 100);
    assert.equal(score(state), courseXp(course.id));
  }
});
test('Pre-redesign saved practice and numeric cursor remain intact; resume after slides selects verification', () => {
  for (const course of courses) {
    const module = course.modules[0];
    let state = restore('{}', course.id);
    for (const activity of module.activities.filter((a) => a.phase === 'learn'))
      state = completeActivity(state, 0, activity.id, at);
    const resume = progressActivity({ ...state, step: 2 });
    assert.equal(resume.activity.phase, 'verify');
    const practice = module.activities.find((a) => a.phase === 'practice');
    state = completeActivity(prepare(state, practice), 0, practice.id, at);
    state = { ...state, step: module.activities.indexOf(practice) };
    const loaded = restore(serialize(state), course.id);
    assert.equal(loaded.step, state.step);
    assert.deepEqual(loaded.completedActivities, state.completedActivities);
    assert.equal(score(loaded), 35);
    assert.equal(canFinish(loaded, 0), false);
  }
});
test('Horizontal swipe is deliberate and vertical scroll, short gestures and slow drags do not advance', () => {
  assert.equal(slideSwipe(-80, 10, 220), 'next');
  assert.equal(slideSwipe(80, 10, 220), 'back');
  assert.equal(slideSwipe(30, 3, 100), null);
  assert.equal(slideSwipe(-60, 70, 200), null);
  assert.equal(slideSwipe(-110, 5, 900), null);
});
test('The renderer recognizes every required activity kind and standalone checklists need all checks', () => {
  assert.equal(
    activityKind({ type: 'comparison', question: {} }),
    'comparison',
  );
  assert.equal(
    activityKind({ type: 'multipleChoice', question: {} }),
    'multipleChoice',
  );
  assert.equal(activityKind({ type: 'textInput' }), 'textInput');
  assert.equal(activityKind({ type: 'checklist' }), 'checklist');
  const activity = {
    id: 'checklist-example',
    type: 'checklist',
    phase: 'learn',
    completionRule: { kind: 'checklist', checklist: ['Uno', 'Due'] },
  };
  let state = restore('{}');
  assert.equal(canCompleteActivity(state, 0, activity), false);
  state = { ...state, activityChecks: { [activity.id]: [0] } };
  assert.equal(canCompleteActivity(state, 0, activity), false);
  state = { ...state, activityChecks: { [activity.id]: [0, 1] } };
  assert.equal(canCompleteActivity(state, 0, activity), true);
});
