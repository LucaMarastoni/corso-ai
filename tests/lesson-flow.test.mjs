import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStepFlow, quizFlowDelay } from '../app/lesson-flow.ts';
import { courses } from '../app/courses.ts';
function harness() {
  const callbacks = [];
  const flow = createStepFlow({
    schedule: (run) => {
      callbacks.push(run);
      return callbacks.length - 1;
    },
    clear: () => {},
  });
  return { callbacks, flow };
}
test('manual navigation runs once even if an old timer fires', () => {
  const { flow, callbacks } = harness();
  let count = 0;
  flow.schedule('a', 400, () => count++);
  assert.equal(flow.finish('a'), true);
  callbacks[0]();
  assert.equal(flow.finish('a'), false);
  assert.equal(count, 1);
});
test('cancelled and replaced steps cannot navigate from stale callbacks', () => {
  const { flow, callbacks } = harness();
  const visits = [];
  flow.schedule('a', 400, () => visits.push('a'));
  flow.cancel();
  callbacks[0]();
  flow.schedule('b', 400, () => visits.push('b'));
  flow.schedule('c', 400, () => visits.push('c'));
  callbacks[1]();
  callbacks[2]();
  assert.deepEqual(visits, ['c']);
});
test('reading, reduced motion and revealed solutions retain an explicit next action', () => {
  assert.equal(
    quizFlowDelay('Hai indicato un obiettivo preciso.', false, false),
    1200,
  );
  assert.equal(
    quizFlowDelay('Hai indicato un obiettivo preciso.', true, false),
    null,
  );
  assert.equal(
    quizFlowDelay('Hai indicato un obiettivo preciso.', false, true),
    null,
  );
  assert.equal(
    quizFlowDelay(
      'Questa spiegazione richiede una lettura attenta e rimane sullo schermo fino a quando scegli di continuare.',
      false,
      false,
    ),
    null,
  );
});
test('expanded lessons preserve activities and use official linked sources', () => {
  const slides = Object.values(courses).flatMap((course) =>
    course.modules.flatMap((module) =>
      module.activities.flatMap((activity) =>
        activity.slide ? [activity.slide] : [],
      ),
    ),
  );
  const articles = slides.filter((slide) => slide.layout === 'article');
  assert.ok(articles.length >= 2);
  for (const slide of articles) {
    assert.ok(slide.steps.length >= 2 && slide.steps.length <= 4);
    assert.ok(
      ['ai.google.dev', 'support.google.com'].includes(
        new URL(slide.source.url).hostname,
      ),
    );
  }
  for (const layout of [
    'diagram',
    'comparison',
    'sequence',
    'example',
    'insight',
  ])
    assert.ok(slides.some((slide) => slide.layout === layout));
});
