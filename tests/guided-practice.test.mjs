import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../app/courses.ts';
import {
  restore as restoreSaved,
  serialize,
  completeActivity,
  score,
  canCompleteActivity,
} from '../app/progress.ts';

const restore = (value, course) =>
  restoreSaved(
    typeof value === 'string' ? value : JSON.stringify(value),
    course,
  );

test('all 26 former writing activities require both choice and reason, using existing response storage', () => {
  let count = 0;
  for (const course of courses) {
    for (const module of course.modules) {
      for (const activity of module.activities.filter((a) => a.guided)) {
        count++;
        assert.equal(activity.guided.choices.length, 2);
        assert.equal(activity.guided.reasons.length, 3);
        assert.equal(activity.completionRule.kind, 'correctSequence');
        let state = restore(
          {
            courseId: course.id,
            responses: { [activity.id]: [activity.interaction.correct[0]] },
          },
          course.id,
        );
        assert.deepEqual(
          restore(serialize(state), course.id).responses[activity.id],
          [activity.interaction.correct[0]],
        );
        assert.equal(
          canCompleteActivity(state, course.modules.indexOf(module), activity),
          false,
        );
        assert.equal(
          score(
            completeActivity(
              state,
              course.modules.indexOf(module),
              activity.id,
            ),
          ),
          0,
        );
      }
      assert.ok(
        module.activities.every(
          (a) => a.completionRule.kind !== 'textChecklist',
        ),
      );
    }
  }
  assert.equal(count, 26);
});
test('previously completed written activities retain XP and evidence across restoration', () => {
  let state = restore({
    courseId: 'ai-basics',
    progressVersion: 3,
    completedActivities: {
      'module-1:learn-1': {
        source: 'current',
        completedAt: '2026-09-08T12:00:00Z',
        xp: 5,
        evidence: 'Letto',
      },
      'module-1:learn-2': {
        source: 'current',
        completedAt: '2026-09-08T12:00:00Z',
        xp: 5,
        evidence: 'Letto',
      },
      'module-1:learn-3': {
        source: 'current',
        completedAt: '2026-09-08T12:00:00Z',
        xp: 5,
        evidence: 'Letto',
      },
      'module-1:practice': {
        source: 'current',
        completedAt: '2026-09-08T12:00:00Z',
        xp: 20,
        evidence: 'Il mio prompt originale',
      },
    },
  });
  assert.equal(score(state), 35);
  assert.equal(
    restore(serialize(state)).completedActivities['module-1:practice'].evidence,
    'Il mio prompt originale',
  );
});
