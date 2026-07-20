const { test } = require('@playwright/test');

test.use({
  viewport: { width: 1280, height: 720 },
  launchOptions: {
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  },
});

test('inspect available Create ID sites', async ({ page }) => {
  const mobile = process.env.KAPUNTER_MOBILE;
  const password = process.env.KAPUNTER_PASSWORD;
  if (!mobile || !password) throw new Error('Missing login credentials.');

  await page.goto('https://kapunter.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByRole('button', { name: /login.*signup/i }).first().click();
  await page.getByPlaceholder('10-digit mobile number').fill(mobile);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.getByPlaceholder('Enter password').fill(password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await page.getByPlaceholder('Enter password').waitFor({ state: 'detached', timeout: 30_000 });

  await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=create', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.locator('.loading-container').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.locator('.site-card-create, .ids-hub-empty').first().waitFor({ timeout: 30_000 });

  const sites = await page.locator('.site-card-create .site-name').allTextContents();
  console.log(`AVAILABLE_CREATE_ID_SITES=${JSON.stringify(sites.map(x => x.trim()).filter(Boolean))}`);
});
