// Optional browser QA, without adding a runtime/project dependency.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/mobile-ui.test.mjs
import assert from 'node:assert/strict';
import { levels } from '../app/journey.ts';
import { initialState, complete, issueCertificate } from '../app/progress.ts';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const url = process.env.ACADEMY_URL || 'http://localhost:3001/';
const store = 'ai-course-journey-v2';
async function view(screen) {
  await page.evaluate((screen) => {
    location.hash = screen;
  }, screen);
  await page.waitForFunction(
    (screen) =>
      document.querySelector('.academy-app').dataset.screen === screen,
    screen,
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function saved() {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), store);
}
async function bounds(label) {
  const actual = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-navigation');
    const visible = (element) => element.getBoundingClientRect().width > 0;
    return {
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      targets: [
        ...nav.querySelectorAll('a'),
        ...document.querySelectorAll('.step-nav button'),
      ]
        .filter(visible)
        .every((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        }),
      escaped: [
        ...document.querySelectorAll('main button, main input, main textarea'),
      ]
        .filter(visible)
        .filter(
          (element) => element.getBoundingClientRect().right > innerWidth + 1,
        ).length,
    };
  });
  assert.equal(actual.width, actual.viewport, `${label}: horizontal overflow`);
  assert.equal(actual.targets, true, `${label}: navigation touch targets`);
  assert.equal(actual.escaped, 0, `${label}: controls outside viewport`);
}
try {
  await page.goto(url);
  await page.waitForFunction(
    () => !document.querySelector('.course-continue').disabled,
  );
  assert.equal(
    (await saved()).seen.length,
    0,
    'Home must not mark an unseen mobile lesson as read',
  );
  await page.locator('.course-continue').click();
  await page.waitForFunction(
    () => document.querySelector('.academy-app').dataset.screen === 'lesson',
  );
  for (let i = 0; i < 3; i++)
    await page.locator('.activity-footer .primary').click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('radio').nth(levels[0].challenges[i].correct).check();
    await page.getByRole('button', { name: 'Controlla', exact: true }).click();
    await page.locator('.feedback.success').waitFor();
    await page.locator('.activity-footer .primary').click();
  }
  await page
    .locator('#work')
    .fill(
      'Una consegna chiara con obiettivo, contesto e vincoli verificabili.',
    );
  for (const checkbox of await page
    .locator('.self-check')
    .getByRole('checkbox')
    .all())
    await checkbox.check();
  await page
    .getByRole('button', { name: 'Completa il livello', exact: true })
    .click();
  assert.deepEqual((await saved()).completed, [0]);
  await view('progress');
  assert.equal(await page.locator('.academy-badge').count(), 3);
  await page.getByRole('button', { name: /Vedi tutti i badge/ }).click();
  assert.equal(await page.locator('.academy-badge').count(), 6);
  await page.getByRole('button', { name: 'Mostra meno' }).click();
  await page.locator('.academy-badge').first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await view('profile');
  await page.locator('.profile-screen input').fill('Test Academy');
  await page.reload();
  await page.waitForFunction(
    () =>
      document.querySelector('.profile-screen input').value === 'Test Academy',
  );
  assert.deepEqual((await saved()).completed, [0]);
  const download = page.waitForEvent('download');
  await page
    .locator('.profile-screen')
    .getByRole('button', { name: /Scarica il tuo quaderno/ })
    .click();
  assert.ok((await download).suggestedFilename());
  for (const width of [320, 360, 375, 390, 393, 414, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const screen of ['home', 'lessons', 'lesson', 'progress', 'profile']) {
      await view(screen);
      await bounds(`${width}/${screen}`);
      await page.evaluate(() =>
        scrollTo(0, document.documentElement.scrollHeight),
      );
      const clear = await page.evaluate(() => {
        const main = document.querySelector('main').getBoundingClientRect();
        const nav = document
          .querySelector('.bottom-navigation')
          .getBoundingClientRect();
        return {
          clear: main.bottom <= nav.top + 1,
          main: main.bottom,
          nav: nav.top,
          y: scrollY,
          height: document.documentElement.scrollHeight,
        };
      });
      assert.ok(
        clear.clear,
        `${width}/${screen}: bottom navigation covers final content ${JSON.stringify(clear)}`,
      );
    }
  }
  // Every slide, challenge, and lab remains responsive, including long copy.
  for (const width of [320, 393]) {
    await page.setViewportSize({ width, height: 844 });
    let state = initialState;
    for (let n = 0; n < 6; n++) {
      state = complete(
        {
          ...state,
          seen: [...state.seen, ...[0, 1, 2].map((i) => `${n}:${i}`)],
          solved: [...state.solved, ...[0, 1, 2].map((i) => `${n}:${i}`)],
          notes: {
            ...state.notes,
            [n]: 'Un prompt completo con contesto, obiettivo e revisione verificabile.',
          },
          checks: { ...state.checks, [n]: [0, 1, 2] },
        },
        n,
      );
    }
    const finished = issueCertificate(
      state,
      'Test Academy',
      '2026-09-06',
      'PAI-2026-TEST1234',
    );
    for (let levelIndex = 0; levelIndex < 6; levelIndex++) {
      await page.evaluate(
        ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
        { key: store, state: { ...finished, level: levelIndex, step: 0 } },
      );
      await page.reload();
      await view('lesson');
      await page.waitForFunction(
        (n) =>
          document
            .querySelector('.mobile-lesson-header')
            .textContent.includes(`Modulo ${n + 1}`),
        levelIndex,
      );
      for (let step = 0; step < 7; step++) {
        await page.locator('.step-nav button').nth(step).click();
        await bounds(`${width}/module-${levelIndex}/step-${step}`);
      }
    }
    await view('profile');
    await page
      .locator('.profile-screen')
      .getByRole('button', { name: 'Apri attestato' })
      .click();
    await page.locator('.certificate-preview').waitFor();
    const certificate = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Scarica il certificato PNG' })
      .click();
    assert.match(
      (await certificate).suggestedFilename(),
      /certificato.*\.png$/,
    );
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.ok(await page.locator('.lesson-panel').isVisible());
  assert.ok(await page.locator('.level-map').isVisible());
  assert.ok(await page.locator('.mission-aside').isVisible());
  assert.equal(await page.locator('.bottom-navigation').isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 40 screen/viewport combinations; 84 activity/viewport combinations; first module, badges, profile persistence, notebook and certificate downloads; desktop smoke check.',
  );
} finally {
  await browser.close();
}
