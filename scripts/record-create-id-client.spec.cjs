/**
 * Records a real Create ID client-reference video on kapunter.com.
 * Password is masked in screenshots/video via CSS.
 *
 * Env: KAPUNTER_MOBILE, KAPUNTER_PASSWORD, KAPUNTER_SITE, KAPUNTER_USERNAME
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const OUT_DIR = path.join(
  __dirname,
  '../projects/kapunter-website/src/assets/videos'
);
const WORK_DIR = path.join(__dirname, '../projects/kapunter-website/.record-work');
const EDGE =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FPS = 30;
const FRAME_SEC = 4;

test.use({
  viewport: { width: 1280, height: 720 },
  launchOptions: { executablePath: EDGE },
});

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let err = '';
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed: ${err.slice(-800)}`));
    });
  });
}

async function findFfmpeg() {
  try {
    await run('ffmpeg', ['-version']);
    return 'ffmpeg';
  } catch {
    const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(base)) {
      for (const d of fs.readdirSync(base).filter(x => x.toLowerCase().includes('ffmpeg'))) {
        const root = path.join(base, d);
        for (const sub of fs.readdirSync(root)) {
          const bin = path.join(root, sub, 'bin', 'ffmpeg.exe');
          if (fs.existsSync(bin)) return bin;
        }
      }
    }
    throw new Error('ffmpeg not found');
  }
}

async function snap(page, frames, name) {
  const file = path.join(WORK_DIR, `${String(frames.length).padStart(3, '0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  frames.push(file);
}

async function buildVideo(frames, outFile) {
  const ffmpeg = await findFfmpeg();
  const listPath = path.join(WORK_DIR, 'frames.txt');
  const body =
    frames
      .map(f => {
        const p = f.replace(/\\/g, '/').replace(/'/g, "'\\''");
        return `file '${p}'\nduration ${FRAME_SEC}`;
      })
      .join('\n') + `\nfile '${frames[frames.length - 1].replace(/\\/g, '/')}'\n`;
  await fs.promises.writeFile(listPath, body, 'utf8');
  await run(ffmpeg, [
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
    '-vf', `fps=${FPS},format=yuv420p`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    outFile,
  ]);
}

test('record Create ID flow for client reference', async ({ page }) => {
  const mobile = process.env.KAPUNTER_MOBILE;
  const password = process.env.KAPUNTER_PASSWORD;
  const siteName = process.env.KAPUNTER_SITE || 'Radhe exchange';
  const username = process.env.KAPUNTER_USERNAME || 'test123';

  if (!mobile || !password) {
    throw new Error('Set KAPUNTER_MOBILE and KAPUNTER_PASSWORD.');
  }

  await fs.promises.rm(WORK_DIR, { recursive: true, force: true });
  await fs.promises.mkdir(WORK_DIR, { recursive: true });
  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  const frames = [];

  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      input.password, input[type="password"], input[autocomplete="current-password"] {
        -webkit-text-security: disc !important;
        text-security: disc !important;
        color: transparent !important;
        caret-color: #ff8a00 !important;
        background: #1c1826 !important;
      }
    `;
    document.documentElement.appendChild(style);
  });

  await page.goto('https://kapunter.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1000);
  await snap(page, frames, 'home');

  await page.getByRole('button', { name: /login.*signup/i }).first().click();
  await page.getByPlaceholder('10-digit mobile number').fill(mobile);
  await page.waitForTimeout(500);
  await snap(page, frames, 'login-mobile');

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  const pwd = page.getByPlaceholder('Enter password');
  await pwd.fill(password);
  await page.waitForTimeout(500);
  await snap(page, frames, 'login-password-hidden');

  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await pwd.waitFor({ state: 'detached', timeout: 45_000 });
  await page.waitForTimeout(1500);
  await snap(page, frames, 'logged-in');

  await page.goto(
    'https://kapunter.com/site/app-get-user-list-site-by-id?view=create',
    { waitUntil: 'domcontentloaded', timeout: 60_000 }
  );
  await page.locator('.loading-container').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(800);
  await snap(page, frames, 'create-id-list');

  const siteCard = page
    .locator('.site-card-create')
    .filter({ has: page.locator('.site-name', { hasText: siteName }) });
  await expect(siteCard).toBeVisible({ timeout: 20_000 });
  await siteCard.getByRole('button', { name: /create id/i }).click();
  await page.waitForTimeout(600);

  const modal = page.locator('.create-id-modal');
  await expect(modal).toBeVisible({ timeout: 15_000 });
  await snap(page, frames, 'create-id-modal');

  await page.locator('#createIdUsername').fill(username);
  await page.waitForTimeout(700);
  await snap(page, frames, 'username-filled');

  await modal.getByRole('button', { name: 'Create ID', exact: true }).click();
  await Promise.race([
    modal.waitFor({ state: 'hidden', timeout: 30_000 }),
    page.getByText(/ID request submitted/i).waitFor({ timeout: 30_000 }),
  ]).catch(() => {});
  await page.waitForTimeout(1500);
  await snap(page, frames, 'submitted');

  await page.goto(
    'https://kapunter.com/site/app-get-user-list-site-by-id?view=active',
    { waitUntil: 'domcontentloaded', timeout: 60_000 }
  );
  await page.waitForTimeout(1500);
  await snap(page, frames, 'active-ids');

  const clientRef = path.join(OUT_DIR, '01-create-id-client-reference.mp4');
  const guidesVideo = path.join(OUT_DIR, '01-create-id.mp4');
  await buildVideo(frames, clientRef);
  await fs.promises.copyFile(clientRef, guidesVideo);
  console.log(`CLIENT_VIDEO_SAVED=${clientRef}`);
  console.log(`GUIDES_VIDEO_UPDATED=${guidesVideo}`);

  await fs.promises.rm(WORK_DIR, { recursive: true, force: true });
});
