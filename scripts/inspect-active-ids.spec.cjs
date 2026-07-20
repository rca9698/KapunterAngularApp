const { test, expect } = require('@playwright/test');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const fs = require('fs');
const path = require('path');

test.use({
  viewport: { width: 1280, height: 720 },
  launchOptions: { executablePath: EDGE },
});

test('dump active IDs after solid login', async ({ page }) => {
  const mobile = process.env.KAPUNTER_MOBILE;
  const password = process.env.KAPUNTER_PASSWORD;

  await page.goto('https://kapunter.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByRole('button', { name: /login.*signup/i }).first().click();
  await page.getByPlaceholder('10-digit mobile number').fill(mobile);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Password', exact: true }).click({ timeout: 15_000 });
  await page.getByPlaceholder('Enter password').fill(password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();

  // Wait until login modal is gone AND login CTA disappears
  await page.getByPlaceholder('Enter password').waitFor({ state: 'detached', timeout: 45_000 }).catch(() => {});
  await page.getByRole('button', { name: /login.*signup/i }).first()
    .waitFor({ state: 'hidden', timeout: 45_000 })
    .catch(() => {});
  await page.waitForTimeout(1500);

  const loggedIn = !(await page.getByRole('button', { name: /login.*signup/i }).first().isVisible().catch(() => false));
  console.log(`LOGGED_IN=${loggedIn}`);
  console.log(`URL_AFTER_LOGIN=${page.url()}`);

  await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=active', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(4000);

  const outDir = path.join(__dirname, '../projects/kapunter-website/.record-work');
  fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: path.join(outDir, 'active-dump.png'), fullPage: false });

  const info = await page.evaluate(() => ({
    url: location.href,
    bodyText: document.body.innerText.slice(0, 3000),
    cards: document.querySelectorAll('article.site-card').length,
    empty: !!document.querySelector('.ids-hub-empty'),
    loading: !!document.querySelector('.loading-container'),
    siteNames: Array.from(document.querySelectorAll('.site-name')).map(n => n.textContent.trim()),
    actions: Array.from(document.querySelectorAll('.site-action span')).map(n => n.textContent.trim()),
    tabs: Array.from(document.querySelectorAll('.ids-hub-tab')).map(t => t.textContent.trim()),
  }));
  console.log('DUMP=' + JSON.stringify(info, null, 2));
});
