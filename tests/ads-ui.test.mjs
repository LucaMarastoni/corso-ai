import assert from 'node:assert/strict';
import { examReady, adsFinished } from './courses.test.mjs';
import { getCourse } from '../app/courses.ts';
import { serialize, startExam, score } from '../app/progress.ts';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const ads = getCourse('google-ads'),
  url = process.env.ACADEMY_URL || 'http://localhost:3001/';
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.academy-app') &&
      !document.querySelector('.course-continue')?.disabled,
  );
}
async function seed(state) {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: ads.storageKey,
    value: serialize(state),
  });
  await page.reload();
  await ready();
}
async function saved() {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    ads.storageKey,
  );
}
async function view(screen) {
  await page.evaluate((s) => (location.hash = s), screen);
  await page.waitForFunction(
    (s) => document.querySelector('.academy-app').dataset.screen === s,
    screen,
  );
}
async function bounds() {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    'horizontal overflow',
  );
}
try {
  await page.goto(url);
  await ready();
  assert.equal(await page.locator('.su-course-card').count(), 6);
  await page.screenshot({
    path: 'outputs/learning-qa/catalog-mobile.png',
    fullPage: true,
  });
  const aiBefore = await page.evaluate(() =>
    localStorage.getItem('ai-course-journey-v3'),
  );
  await page.locator('.su-course-copy a[href*="google-ads"]').click();
  await ready();
  assert.ok(page.url().includes('google-ads'));
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  assert.equal(score(await saved()), 5);
  assert.equal(
    await page.evaluate(() => localStorage.getItem('ai-course-journey-v3')),
    aiBefore,
  );
  const full = adsFinished();
  await seed({ ...full, level: 0, step: 6, responses: {} });
  await view('lesson');
  assert.equal(await page.locator('.ordering-list li').count(), 3);
  await page
    .getByRole('button', { name: /Sposta su/ })
    .nth(1)
    .click();
  await page.screenshot({
    path: 'outputs/learning-qa/ads-ordering.png',
    fullPage: true,
  });
  await seed({ ...full, level: 4, step: 4, responses: {} });
  await view('lesson');
  const matching = ads.modules[4].activities[4];
  for (let i = 0; i < 3; i++)
    await page
      .locator('.matching-row select')
      .nth(i)
      .selectOption(matching.interaction.correct[i]);
  assert.ok(await page.locator('.feedback.success').isVisible());
  await page.reload();
  await ready();
  assert.equal(
    await page.locator('.matching-row select').first().inputValue(),
    matching.interaction.correct[0],
  );
  await page.screenshot({
    path: 'outputs/learning-qa/ads-matching.png',
    fullPage: true,
  });
  await seed(startExam(examReady(), () => 0.37));
  await view('lesson');
  assert.equal(await page.locator('.exam-question').count(), 12);
  assert.equal(await page.locator('.exam-solutions').count(), 0);
  for (let i = 0; i < 12; i++)
    await page
      .locator('.exam-question')
      .nth(i)
      .getByRole('radio')
      .first()
      .check();
  const answers = (await saved()).examAttempts.at(-1).answers;
  await page.reload();
  await ready();
  assert.deepEqual((await saved()).examAttempts.at(-1).answers, answers);
  await page.screenshot({
    path: 'outputs/learning-qa/ads-exam.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Consegna e vedi il risultato' })
    .click();
  await page.locator('.exam-result').waitFor();
  assert.ok((await page.locator('.exam-topic').count()) > 0);
  await page.screenshot({
    path: 'outputs/learning-qa/ads-result.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Riprova con un nuovo test' }).click();
  const attempt = (await saved()).examAttempts.at(-1);
  for (let i = 0; i < 12; i++) {
    const q = ads.exam.questions.find((q) => q.id === attempt.questionIds[i]);
    await page
      .locator('.exam-question')
      .nth(i)
      .getByRole('radio')
      .nth(q.correct)
      .check();
  }
  await page
    .getByRole('button', { name: 'Consegna e vedi il risultato' })
    .click();
  assert.equal(
    await page.locator('.exam-result .progress-display').textContent(),
    '100%',
  );
  await seed(full);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of ['home', 'lessons', 'lesson', 'progress', 'profile']) {
      await view(screen);
      await bounds();
    }
  }
  for (const width of [320, 393]) {
    await page.setViewportSize({ width, height: 844 });
    for (let n = 0; n < 7; n++)
      for (let step = 0; step < ads.modules[n].activities.length; step++) {
        await seed({ ...full, level: n, step });
        await view('lesson');
        await bounds();
      }
  }
  await view('progress');
  await page.screenshot({
    path: 'outputs/learning-qa/ads-progress.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Prepara attestato', exact: true })
    .click();
  await page.locator('#finale-name').fill('Test Academy');
  await page.getByRole('button', { name: 'Genera il certificato' }).click();
  assert.equal(await page.locator('.certificate-competencies li').count(), 7);
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Scarica il certificato PNG' })
    .click();
  await (await pending).saveAs('outputs/learning-qa/ads-certificate.png');
  assert.deepEqual(errors, []);
  console.log(
    'PASS Ads: catalog, isolation, matching, ordering, exam persistence/result/retry, 20 screens and 122 activity/viewports, certificate.',
  );
} finally {
  await browser.close();
}
