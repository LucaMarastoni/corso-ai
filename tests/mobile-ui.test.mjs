// PLAYWRIGHT_MODULE=/absolute/path/playwright/index.mjs node tests/mobile-ui.test.mjs
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { courseModules } from '../app/learning-model.ts';
import {
  initialState,
  completeActivity,
  setDraft,
  serialize,
  score,
  STORE,
  LEGACY_STORE,
} from '../app/progress.ts';
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
async function view(screen) {
  await page.evaluate((s) => (location.hash = s), screen);
  await page.waitForFunction(
    (s) => document.querySelector('.academy-app').dataset.screen === s,
    screen,
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function ready() {
  await page.waitForFunction(
    () => !document.querySelector('.course-continue').disabled,
  );
}
async function saved() {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORE);
}
async function bounds(label) {
  const result = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    bad: [
      ...document.querySelectorAll(
        '.bottom-navigation a,.learning-phases button,.step-nav button',
      ),
    ]
      .filter((e) => e.getBoundingClientRect().width)
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width < 44 || r.height < 44;
      })
      .map((e) => e.textContent),
  }));
  assert.equal(result.width, result.viewport, `${label}: overflow`);
  assert.deepEqual(result.bad, [], `${label}: touch targets`);
}
async function seed(s) {
  await page.evaluate(({ key, state }) => localStorage.setItem(key, state), {
    key: STORE,
    state: serialize(s),
  });
  await page.reload();
  await ready();
}
function fullCourse() {
  let s = initialState;
  for (let n = 0; n < courseModules.length; n++)
    for (const a of courseModules[n].activities) {
      if (a.question)
        s = { ...s, answers: { ...s.answers, [a.id]: a.question.correct } };
      if (a.completionRule.kind === 'textChecklist') {
        s = setDraft(
          s,
          a.id,
          'Una richiesta completa con obiettivo, contesto e formato. Controllerò i fatti e il risultato.',
        );
        s = {
          ...s,
          activityChecks: {
            ...s.activityChecks,
            [a.id]: a.completionRule.checklist.map((_, i) => i),
          },
        };
      }
      s = completeActivity(s, n, a.id, '2026-09-06T12:00:00.000Z');
    }
  return s;
}
try {
  await mkdir('outputs/learning-qa', { recursive: true });
  await page.goto(url);
  await ready();
  assert.equal(Object.keys((await saved()).completedActivities).length, 0);
  await page.locator('.course-continue').click();
  await view('lesson');
  assert.ok(
    await page
      .getByRole('button', { name: '2 Prova', exact: true })
      .isDisabled(),
  );
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole('button', { name: 'Ho letto e compreso', exact: true })
      .click();
    await page.getByRole('button', { name: 'Continua', exact: true }).click();
  }
  assert.equal(score(await saved()), 15);
  await page
    .locator('.activity-text textarea')
    .fill(
      'Scrivi una email cordiale a un cliente per confermare una riunione venerdì. Massimo 100 parole.',
    );
  await page.locator('.self-check').getByRole('checkbox').check();
  await page.reload();
  await ready();
  assert.match(
    await page.locator('.activity-text textarea').inputValue(),
    /riunione/,
  );
  assert.ok(
    await page.locator('.self-check').getByRole('checkbox').isChecked(),
  );
  await page.screenshot({
    path: 'outputs/learning-qa/practice-390.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Conferma la pratica', exact: true })
    .click();
  assert.equal(score(await saved()), 35);
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    const answer = courseModules[0].phases[2].activities[i].question.correct;
    await page
      .getByRole('radio')
      .nth(1 - answer)
      .check();
    assert.ok(
      await page
        .getByRole('button', { name: 'Conferma la verifica', exact: true })
        .isDisabled(),
    );
    await page.getByRole('radio').nth(answer).check();
    if (i === 0) {
      await page.reload();
      await ready();
      assert.ok(await page.getByRole('radio').nth(answer).isChecked());
    }
    await page
      .getByRole('button', { name: 'Conferma la verifica', exact: true })
      .click();
    await page.getByRole('button', { name: 'Continua', exact: true }).click();
  }
  await page
    .locator('.activity-text textarea')
    .fill(
      'Riscrivi il messaggio per un cliente in tono cordiale. Mantieni i fatti e chiedi conferma; controllerò nomi e date.',
    );
  for (const box of await page
    .locator('.self-check')
    .getByRole('checkbox')
    .all())
    await box.check();
  await page
    .getByRole('button', { name: 'Completa l’applicazione', exact: true })
    .click();
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  assert.equal(score(await saved()), 175);
  assert.equal(Object.keys((await saved()).competencyAwards).length, 0);
  await page
    .getByRole('button', { name: 'Sblocca il risultato', exact: true })
    .click();
  assert.equal(score(await saved()), 225);
  assert.ok((await saved()).competencyAwards['fundamental-prompting']);
  assert.ok((await saved()).achievementAwards['signal-frame']);
  await page.screenshot({
    path: 'outputs/learning-qa/unlock-390.png',
    fullPage: true,
  });
  await view('progress');
  assert.equal(await page.locator('.academy-badge').count(), 3);
  await page
    .getByRole('button', { name: 'Vedi tutti gli achievement' })
    .click();
  assert.equal(await page.locator('.academy-badge').count(), 6);
  await page.getByRole('button', { name: 'Mostra meno' }).click();
  await page.screenshot({
    path: 'outputs/learning-qa/progress-390.png',
    fullPage: true,
  });
  await page.locator('.academy-badge').first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  for (const width of [320, 360, 375, 390, 393, 414, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const screen of ['home', 'lessons', 'lesson', 'progress', 'profile']) {
      await view(screen);
      await bounds(`${width}/${screen}`);
      await page.evaluate(() =>
        scrollTo(0, document.documentElement.scrollHeight),
      );
      assert.ok(
        await page.evaluate(
          () =>
            document.querySelector('main').getBoundingClientRect().bottom <=
            document.querySelector('.bottom-navigation').getBoundingClientRect()
              .top +
              1,
        ),
        `${width}/${screen}: final content covered`,
      );
    }
  }
  const full = fullCourse();
  assert.equal(score(full), 1350);
  for (const width of [320, 393]) {
    await page.setViewportSize({ width, height: 844 });
    for (let n = 0; n < 6; n++)
      for (let step = 0; step < courseModules[n].activities.length; step++) {
        await seed({ ...full, level: n, step });
        await view('lesson');
        await bounds(`${width}/module-${n}/activity-${step}`);
      }
  }
  await view('progress');
  await page
    .getByRole('button', { name: 'Prepara attestato', exact: true })
    .click();
  await page.locator('#finale-name').fill('Test Academy');
  await page.getByRole('button', { name: 'Genera il certificato' }).click();
  await page.locator('.certificate-preview').waitFor();
  assert.equal(await page.locator('.certificate-competencies li').count(), 6);
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Scarica il certificato PNG' })
    .click();
  const file = await download;
  await file.saveAs('outputs/learning-qa/certificate.png');
  assert.match(file.suggestedFilename(), /\.png$/);
  await page.keyboard.press('Escape');
  await view('profile');
  await page.locator('.profile-screen input').fill('Test Academy modificato');
  await page.reload();
  await ready();
  assert.equal(
    await page.locator('.profile-screen input').inputValue(),
    'Test Academy modificato',
  );
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  for (const screen of ['home', 'lessons', 'lesson', 'progress', 'profile']) {
    await view(screen);
    await bounds(`200%/${screen}`);
  }
  await page.reload();
  await ready();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await view('home');
  assert.ok(await page.locator('.learning-experience').isVisible());
  await view('progress');
  assert.ok(await page.locator('.progress-profile').isVisible());
  await page.screenshot({
    path: 'outputs/learning-qa/progress-desktop.png',
    fullPage: true,
  });
  // Browser migration and raw backup remain local and untouched.
  const old = JSON.stringify({
    level: 0,
    step: 3,
    seen: ['0:0', '0:1', '0:2'],
    solved: ['0:0'],
    completed: [],
    notes: { 0: 'Bozza precedente' },
    checks: {},
  });
  await page.evaluate(
    ({ key, oldKey, raw }) => {
      localStorage.removeItem(key);
      localStorage.setItem(oldKey, raw);
    },
    { key: STORE, oldKey: LEGACY_STORE, raw: old },
  );
  await page.reload();
  await ready();
  assert.equal(score(await saved()), 20);
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), LEGACY_STORE),
    old,
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS: first module five-phase flow, refresh/drafts/answers, migration, XP and competency separation, 40 viewport/screens, 108 activity/viewports, 200% text, final certificate PNG and desktop.',
  );
} finally {
  await browser.close();
}
