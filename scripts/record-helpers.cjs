/**
 * Polished Kapunter guide recording helpers:
 * - Arrow + highlight overlays on real UI
 * - Caption / step banner
 * - Edge neural TTS: English, Hindi, Kannada
 * - Privacy masking (mobile first-4, username first letter, passwords hidden)
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const OUT_DIR = path.join(__dirname, '../projects/kapunter-website/src/assets/videos');
const WORK_ROOT = path.join(__dirname, '../projects/kapunter-website/.record-work');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FPS = 30;
/** Minimum seconds each step stays on screen (audio can extend it). */
const FRAME_SEC = 9;

const LANGS = {
  en: { code: 'en', voice: 'en-IN-NeerjaNeural', label: 'English' },
  hi: { code: 'hi', voice: 'hi-IN-SwaraNeural', label: 'Hindi' },
  kn: { code: 'kn', voice: 'kn-IN-SapnaNeural', label: 'Kannada' },
};

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let err = '';
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${err.slice(-1200)}`));
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
        for (const sub of fs.readdirSync(path.join(base, d))) {
          const bin = path.join(base, d, sub, 'bin', 'ffmpeg.exe');
          if (fs.existsSync(bin)) return bin;
        }
      }
    }
    throw new Error('ffmpeg not found');
  }
}

async function injectPrivacyCss(page) {
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.id = 'kapunter-privacy-mask';
    style.textContent = `
      input.password, input[type="password"],
      input[autocomplete="current-password"], input[autocomplete="new-password"] {
        -webkit-text-security: disc !important;
        text-security: disc !important;
        color: transparent !important;
        caret-color: #ff8a00 !important;
      }
    `;
    document.documentElement.appendChild(style);
  });
}

async function clearGuideUi(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.kw-guide-layer').forEach(el => el.remove());
  });
}

/**
 * Draw highlight ring + big arrow + tip bubble pointing at a selector or Playwright locator.
 * `target` may be a CSS selector string or an object with { x, y, width, height }.
 */
async function pointAt(page, target, tip) {
  await clearGuideUi(page);

  let box = null;
  if (typeof target === 'string') {
    // CSS only — no Playwright :has-text()
    const ok = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    }, target);
    box = ok;
  } else if (target && typeof target.boundingBox === 'function') {
    // Playwright Locator
    await target.scrollIntoViewIfNeeded().catch(() => {});
    box = await target.boundingBox();
  } else if (target && typeof target.x === 'number') {
    box = target;
  }

  if (!box) return false;

  await page.evaluate(({ box, tip }) => {
    const r = box;
    const layer = document.createElement('div');
    layer.className = 'kw-guide-layer';
    layer.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none;';

    const dim = document.createElement('div');
    dim.style.cssText = `
      position:absolute; inset:0;
      background: radial-gradient(ellipse at ${r.x + r.width / 2}px ${r.y + r.height / 2}px,
        transparent 0, transparent ${Math.max(r.width, r.height) + 40}px, rgba(0,0,0,0.48) 58%);
    `;
    layer.appendChild(dim);

    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute;
      left:${r.x - 8}px; top:${r.y - 8}px;
      width:${r.width + 16}px; height:${r.height + 16}px;
      border:3px solid #ff8a00; border-radius:14px;
      box-shadow:0 0 0 5px rgba(255,138,0,0.28), 0 0 28px rgba(255,138,0,0.55);
      background:rgba(255,138,0,0.06);
    `;
    layer.appendChild(ring);

    const arrowTop = Math.max(12, r.y - 78);
    const arrowLeft = Math.min(window.innerWidth - 70, Math.max(12, r.x + r.width / 2 - 28));
    const arrow = document.createElement('div');
    arrow.textContent = '⬇️';
    arrow.style.cssText = `
      position:absolute; left:${arrowLeft}px; top:${arrowTop}px;
      font-size:54px; line-height:1;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.65));
      animation: kwBounce 0.9s ease-in-out infinite;
    `;
    layer.appendChild(arrow);

    const tipLeft = Math.min(window.innerWidth - 320, Math.max(16, r.x));
    const tipTop = Math.min(window.innerHeight - 90, r.y + r.height + 16);
    const bubble = document.createElement('div');
    bubble.textContent = tip;
    bubble.style.cssText = `
      position:absolute; left:${tipLeft}px; top:${tipTop}px;
      max-width:300px; padding:12px 16px;
      background:linear-gradient(135deg,#ff8a00,#ff6300);
      color:#1a0e00; font:700 15px/1.35 Segoe UI,Arial,sans-serif;
      border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.45);
    `;
    layer.appendChild(bubble);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes kwBounce {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(10px); }
      }
    `;
    layer.appendChild(style);
    document.body.appendChild(layer);
  }, { box, tip });

  await page.waitForTimeout(350);
  return true;
}

/**
 * Full-screen teaching card when a live control is not available.
 */
async function teachCard(page, opts) {
  await clearGuideUi(page);
  await page.evaluate((o) => {
    const layer = document.createElement('div');
    layer.className = 'kw-guide-layer';
    layer.style.cssText = `
      position:fixed; inset:0; z-index:2147483646; pointer-events:none;
      display:flex; align-items:center; justify-content:center;
      background:rgba(9,7,14,0.55);
      backdrop-filter: blur(2px);
    `;
    const card = document.createElement('div');
    card.style.cssText = `
      width:min(920px,92vw); background:linear-gradient(165deg,#1c1826,#100e16);
      border:1px solid rgba(255,138,0,0.35); border-radius:22px; padding:28px 28px 24px;
      box-shadow:0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(255,138,0,0.15);
      color:#fff3e5; font-family:Segoe UI,Arial,sans-serif;
    `;
    const actions = (o.actions || [])
      .map((a, i) => {
        const active = i === (o.activeIndex || 0);
        return `<div style="
          display:flex; align-items:center; gap:12px; padding:14px 16px; margin:8px 0;
          border-radius:14px; border:2px solid ${active ? '#ff8a00' : 'rgba(255,243,229,0.12)'};
          background:${active ? 'rgba(255,138,0,0.16)' : 'rgba(255,243,229,0.04)'};
          position:relative;">
          <span style="font-size:22px">${a.icon || '•'}</span>
          <div style="flex:1">
            <strong style="display:block;font-size:16px">${a.title}</strong>
            <span style="color:#b8a992;font-size:13px">${a.desc || ''}</span>
          </div>
          ${active ? '<span style="font-size:34px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))">👈</span>' : ''}
        </div>`;
      })
      .join('');

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="color:#ff8a00;font-weight:800;letter-spacing:.12em;font-size:12px;text-transform:uppercase">${o.eyebrow || 'KAPUNTER GUIDE'}</span>
        <span style="background:rgba(255,138,0,.15);border:1px solid rgba(255,138,0,.4);color:#ff8a00;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700">STEP ${o.step || ''}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:28px;color:#fff3e5">${o.title}</h2>
      <p style="margin:0 0 18px;color:#ffcc9f;font-size:16px;line-height:1.5">${o.subtitle || ''}</p>
      ${actions}
      ${o.footer ? `<p style="margin:16px 0 0;color:#b8a992;font-size:14px">${o.footer}</p>` : ''}
    `;
    layer.appendChild(card);
    document.body.appendChild(layer);
  }, opts);
  await page.waitForTimeout(300);
}

async function withMaskedDisplay(page, fn) {
  await page.evaluate(() => {
    document.querySelectorAll('input').forEach(el => {
      const fc = (el.getAttribute('formcontrolname') || '').toLowerCase();
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const type = (el.type || '').toLowerCase();
      const v = el.value || '';
      if (!v) return;
      if (type === 'password' || fc.includes('password') || ph.includes('password')) return;
      if (type === 'tel' || fc.includes('usernumber') || ph.includes('mobile') || ph.includes('10-digit')) {
        el.setAttribute('data-kw-real', v);
        el.value = v.slice(0, 4) + '******';
        return;
      }
      if (id === 'createidusername' || fc === 'username' || ph.includes('username')) {
        el.setAttribute('data-kw-real', v);
        el.value = v.charAt(0) + '*****';
        return;
      }
      if (fc === 'anumber' || (ph.includes('account') && ph.includes('number'))) {
        el.setAttribute('data-kw-real', v);
        el.value = v.slice(0, 2) + '******' + v.slice(-2);
        return;
      }
      if (fc === 'ifsccode' || ph.includes('ifsc')) {
        el.setAttribute('data-kw-real', v);
        el.value = v.slice(0, 4) + '****';
      }
    });
    document.querySelectorAll('.site-username-line').forEach(el => {
      const text = el.textContent || '';
      if (/ID:\s*\S+/i.test(text)) {
        el.setAttribute('data-kw-real-text', text);
        el.textContent = text.replace(/ID:\s*(\S+)/i, (_, u) => `ID: ${u.charAt(0)}*****`);
      }
    });
  });
  try {
    return await fn();
  } finally {
    await page.evaluate(() => {
      document.querySelectorAll('[data-kw-real]').forEach(el => {
        el.value = el.getAttribute('data-kw-real') || '';
        el.removeAttribute('data-kw-real');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      document.querySelectorAll('[data-kw-real-text]').forEach(el => {
        el.textContent = el.getAttribute('data-kw-real-text') || '';
        el.removeAttribute('data-kw-real-text');
      });
    });
  }
}

async function snap(page, frames, name, narrations, caption) {
  await withMaskedDisplay(page, async () => {
    // Caption banner
    await page.evaluate((cap) => {
      document.querySelectorAll('.kw-guide-caption').forEach(e => e.remove());
      if (!cap) return;
      const bar = document.createElement('div');
      bar.className = 'kw-guide-layer kw-guide-caption';
      bar.style.cssText = `
        position:fixed; left:0; right:0; bottom:0; z-index:2147483647; pointer-events:none;
        padding:18px 28px 22px;
        background:linear-gradient(180deg, transparent, rgba(9,7,14,0.92) 28%);
        color:#fff3e5; font:600 20px/1.35 Segoe UI,Arial,sans-serif;
        text-shadow:0 2px 8px rgba(0,0,0,.6);
      `;
      bar.innerHTML = `<div style="max-width:1100px;margin:0 auto">${cap}</div>`;
      document.body.appendChild(bar);
    }, caption || (narrations && narrations.en) || '');

    const file = path.join(frames.dir, `${String(frames.items.length).padStart(3, '0')}-${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    frames.items.push({
      file,
      name,
      narrations: {
        en: narrations.en || '',
        hi: narrations.hi || narrations.en || '',
        kn: narrations.kn || narrations.en || '',
      },
    });
  });
}

async function speakEdge(text, voice, outDir) {
  await fs.promises.mkdir(outDir, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  // Calm, clear pace — not rushed; slightly slower for clarity
  const result = await tts.toFile(outDir, text || ' ', { rate: 0.82, pitch: '-2%' });
  return result.audioFilePath;
}

async function probeDuration(ffmpeg, file) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg.replace('ffmpeg', 'ffprobe').includes('ffprobe')
      ? ffmpeg.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1')
      : 'ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file,
    ], { windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        // fallback path search
        resolve(FRAME_SEC);
        return;
      }
      const n = parseFloat(out.trim());
      resolve(Number.isFinite(n) ? n : FRAME_SEC);
    });
  });
}

async function findFfprobe(ffmpegPath) {
  if (ffmpegPath === 'ffmpeg') return 'ffprobe';
  const probe = ffmpegPath.replace(/ffmpeg\.exe$/i, 'ffprobe.exe').replace(/ffmpeg$/i, 'ffprobe');
  if (fs.existsSync(probe)) return probe;
  return 'ffprobe';
}

async function buildLangVideo(frames, langCode, outFile) {
  const ffmpeg = await findFfmpeg();
  const ffprobe = await findFfprobe(ffmpeg);
  const dir = path.join(frames.dir, `build-${langCode}`);
  await fs.promises.mkdir(dir, { recursive: true });

  const voice = LANGS[langCode].voice;
  const held = [];

  for (let i = 0; i < frames.items.length; i++) {
    const text = frames.items[i].narrations[langCode] || frames.items[i].narrations.en;
    const ttsDir = path.join(dir, `tts-${i}`);
    const mp3 = await speakEdge(text, voice, ttsDir);
    let speechDur = FRAME_SEC;
    try {
      const child = spawn(ffprobe, [
        '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', mp3,
      ], { windowsHide: true });
      speechDur = await new Promise(resolve => {
        let out = '';
        child.stdout.on('data', d => { out += d.toString(); });
        child.on('close', () => {
          const n = parseFloat(out.trim());
          resolve(Number.isFinite(n) ? n : FRAME_SEC);
        });
        child.on('error', () => resolve(FRAME_SEC));
      });
    } catch {
      speechDur = FRAME_SEC;
    }
    // Hold frame until speech finishes + pause — never rush
    const hold = Math.max(FRAME_SEC, Math.ceil(speechDur + 2.8));
    const padded = path.join(dir, `narr-${i}.wav`);
    await run(ffmpeg, [
      '-y', '-i', mp3,
      '-af', `apad=whole_dur=${hold},atrim=0:${hold}`,
      '-ar', '44100', '-ac', '1', padded,
    ]);
    held.push({ file: frames.items[i].file, audio: padded, hold });
  }

  // Per-step clip with soft fade in/out so the video feels smooth, not jumpy
  const clipPaths = [];
  for (let i = 0; i < held.length; i++) {
    const clip = path.join(dir, `clip-${i}.mp4`);
    const fadeOutStart = Math.max(0.2, held[i].hold - 0.45);
    await run(ffmpeg, [
      '-y', '-loop', '1', '-i', held[i].file,
      '-vf', `fps=${FPS},format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=${fadeOutStart}:d=0.4`,
      '-t', String(held[i].hold),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-tune', 'stillimage',
      clip,
    ]);
    clipPaths.push(clip);
  }

  const listPath = path.join(dir, 'clips.txt');
  await fs.promises.writeFile(
    listPath,
    clipPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'),
    'utf8'
  );

  const silent = path.join(dir, 'silent.mp4');
  await run(ffmpeg, [
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
    '-c', 'copy', silent,
  ]);

  const audioList = path.join(dir, 'audio.txt');
  await fs.promises.writeFile(
    audioList,
    held.map(w => `file '${w.audio.replace(/\\/g, '/')}'`).join('\n'),
    'utf8'
  );
  const audioOut = path.join(dir, 'narration.wav');
  await run(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', audioList, '-c', 'copy', audioOut]);

  await run(ffmpeg, [
    '-y', '-i', silent, '-i', audioOut,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', outFile,
  ]);
  console.log(`VIDEO_SAVED=${outFile}`);
}

async function finishModule(frames, baseName) {
  await fs.promises.mkdir(OUT_DIR, { recursive: true });
  for (const lang of Object.keys(LANGS)) {
    const out = path.join(OUT_DIR, `${baseName}-${lang}.mp4`);
    await buildLangVideo(frames, lang, out);
  }
  // Default English copy used by guides page
  await fs.promises.copyFile(
    path.join(OUT_DIR, `${baseName}-en.mp4`),
    path.join(OUT_DIR, `${baseName}.mp4`)
  );
}

async function loginQuiet(page, mobile, password) {
  await page.goto('https://kapunter.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(800);

  // Already logged in?
  const loginBtn = page.getByRole('button', { name: /login.*signup/i }).first();
  if (!(await loginBtn.isVisible().catch(() => false))) {
    return;
  }

  await loginBtn.click();
  await page.getByPlaceholder('10-digit mobile number').waitFor({ state: 'visible', timeout: 15_000 });
  await page.getByPlaceholder('10-digit mobile number').fill(mobile);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Wait for password tab / field (OTP screen first)
  await page.getByRole('button', { name: 'Password', exact: true }).click({ timeout: 20_000 });
  const pwd = page.getByPlaceholder('Enter password');
  await pwd.waitFor({ state: 'visible', timeout: 15_000 });
  await pwd.fill(password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();

  await pwd.waitFor({ state: 'detached', timeout: 45_000 });
  await page.getByRole('button', { name: /login.*signup/i }).first()
    .waitFor({ state: 'hidden', timeout: 45_000 });
  await page.waitForTimeout(1500);

  const stillLogin = await page.getByRole('button', { name: /login.*signup/i }).first().isVisible().catch(() => false);
  if (stillLogin) {
    throw new Error('Login failed — LOGIN|SIGNUP still visible after password submit.');
  }
}

function newFrames(moduleId) {
  const dir = path.join(WORK_ROOT, moduleId);
  return { dir, items: [], moduleId };
}

async function prepareWork(moduleId) {
  const frames = newFrames(moduleId);
  await fs.promises.rm(frames.dir, { recursive: true, force: true });
  await fs.promises.mkdir(frames.dir, { recursive: true });
  return frames;
}

async function closeModal(page) {
  await clearGuideUi(page);
  // Prefer explicit close buttons inside open modals
  const close = page.locator(
    '.modal.show .modal-chrome-btn-close, .modal.show button[aria-label="Close"], bs-modal-container .modal-chrome-btn-close, .modal-chrome-btn-close'
  ).first();
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(500);
  // Ensure modal backdrop is gone
  await page.locator('.modal-backdrop').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
}

module.exports = {
  OUT_DIR,
  EDGE,
  LANGS,
  injectPrivacyCss,
  clearGuideUi,
  pointAt,
  teachCard,
  snap,
  loginQuiet,
  prepareWork,
  finishModule,
  closeModal,
};
