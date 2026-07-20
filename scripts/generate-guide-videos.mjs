/**
 * Generates Kapunter customer-guide MP4s for assets/videos.
 * Requires ffmpeg on PATH (Gyan full build recommended for SVG).
 *
 * Usage: node scripts/generate-guide-videos.mjs
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm, access } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'projects/kapunter-website/src/assets/videos');
const WORK = path.join(ROOT, 'projects/kapunter-website/.video-work');

const W = 1280;
const H = 720;
const FPS = 30;
const SCENE_SEC = 5;
const INTRO_SEC = 3;

const MODULES = [
  {
    file: '01-create-id.mp4',
    number: '01',
    title: 'Create a gaming ID',
    scenes: [
      {
        title: 'Open Create ID',
        lines: ['Choose preferred site', 'Enter name and mobile', 'Set deposit amount'],
        status: 'Ready',
        narr: 'From home, tap Create ID to start a new gaming account request.'
      },
      {
        title: 'Add your details',
        lines: ['Site selected', 'Player name filled', 'Mobile verified'],
        status: 'Editing',
        narr: 'Enter the required details. Double-check spelling before you continue.'
      },
      {
        title: 'Submit the request',
        lines: ['Review summary', 'Confirm amount', 'Submit for approval'],
        status: 'Pending',
        narr: 'Tap Submit. Admin will approve and create the ID for you.'
      },
      {
        title: 'Admin creates your ID',
        lines: ['Status under review', 'Admin processing', 'You will be notified'],
        status: 'In progress',
        narr: 'Admin reviews, approves, and creates your account. You get notified when ready.'
      }
    ]
  },
  {
    file: '02-bank-details.mp4',
    number: '02',
    title: 'Add bank details',
    scenes: [
      {
        title: 'Open bank section',
        lines: ['Add bank account', 'Add UPI', 'Add QR optional'],
        status: 'Setup',
        narr: 'Go to bank and payment details from the customer menu.'
      },
      {
        title: 'Enter account info',
        lines: ['Account holder', 'Account number', 'IFSC and bank name'],
        status: 'Editing',
        narr: 'Add account holder, number, IFSC — or your UPI ID.'
      },
      {
        title: 'Save for withdrawals',
        lines: ['Primary account set', 'Ready for withdrawals', 'Edit anytime'],
        status: 'Active',
        narr: 'Save once. Kapunter uses these details for fast payouts.'
      }
    ]
  },
  {
    file: '03-manage-id.mp4',
    number: '03',
    title: 'Use your ID after approval',
    scenes: [
      {
        title: 'ID is ready',
        lines: ['ID active', 'Credentials ready', 'Choose an action'],
        status: 'Active',
        narr: 'After approval, open My IDs to see your live gaming ID.'
      },
      {
        title: 'Deposit coins',
        lines: ['UPI / bank / QR', 'Enter amount', 'Confirm payment'],
        status: 'Wallet+',
        narr: 'Deposit coins to your Kapunter wallet in seconds.'
      },
      {
        title: 'Transfer to ID',
        lines: ['Select ID', 'Enter coins', 'Submit transfer'],
        status: 'Transferred',
        narr: 'Transfer wallet coins to your gaming ID to play.'
      },
      {
        title: 'Withdraw winnings',
        lines: ['From ID to wallet', 'Wallet to bank or UPI', '45-min payout SLA'],
        status: 'Payout',
        narr: 'Withdraw from ID to wallet, then request payout to your bank.'
      },
      {
        title: 'View ID and history',
        lines: ['View credentials', 'Transaction history', 'Request statuses'],
        status: 'History',
        narr: 'View ID data and full transaction history anytime.'
      },
      {
        title: 'Remove ID',
        lines: ['Select ID to close', 'Confirm request', 'Admin completes closure'],
        status: 'Closing',
        narr: 'Submit Remove ID when you no longer need the account.'
      }
    ]
  },
  {
    file: '04-change-password.mp4',
    number: '04',
    title: 'Change password',
    scenes: [
      {
        title: 'Go to My Account',
        lines: ['Profile overview', 'Security settings', 'Change password'],
        status: 'Account',
        narr: 'Open My Account to manage profile and security.'
      },
      {
        title: 'Update password',
        lines: ['Current password', 'New password', 'Confirm new password'],
        status: 'Secure',
        narr: 'Enter current password, then set a new strong password.'
      },
      {
        title: 'Password updated',
        lines: ['Password changed', 'Session secured', 'Login with new password'],
        status: 'Done',
        narr: 'Save the change and use the new password on next login.'
      }
    ]
  },
  {
    file: '05-passbook.mp4',
    number: '05',
    title: 'Passbook and live trace',
    scenes: [
      {
        title: 'Open Passbook',
        lines: ['Wallet balance', 'Credit and debit rows', 'Date filters'],
        status: 'Ledger',
        narr: 'Passbook shows every wallet movement with full clarity.'
      },
      {
        title: 'Read each entry',
        lines: ['Type and amount', 'Reference ID', 'Processed time'],
        status: 'Detail',
        narr: 'Tap a row to see amount, type, reference and time.'
      },
      {
        title: 'Live request trace',
        lines: ['Submitted', 'Admin reviewing', 'Completed or paid'],
        status: 'Live',
        narr: 'Live trace follows open requests until they complete.'
      }
    ]
  },
  {
    file: '06-notifications.mp4',
    number: '06',
    title: 'Notifications',
    scenes: [
      {
        title: 'Open notifications',
        lines: ['Unread alerts', 'ID and wallet updates', 'System messages'],
        status: 'Inbox',
        narr: 'Tap the bell for ID, wallet and account alerts.'
      },
      {
        title: 'Act on an alert',
        lines: ['ID approved', 'Withdrawal paid', 'Open related screen'],
        status: 'Action',
        narr: 'Open a notification to jump to the related screen.'
      },
      {
        title: 'Stay in the loop',
        lines: ['Mark as read', 'Clear old alerts', '24x7 updates'],
        status: 'Synced',
        narr: 'Keep notifications on so you never miss approvals or payouts.'
      }
    ]
  }
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function introSvg(mod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09070e"/>
      <stop offset="100%" stop-color="#1c1826"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff8a00"/>
      <stop offset="100%" stop-color="#ff6300"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="980" cy="180" r="260" fill="#ff8a00" fill-opacity="0.1"/>
  <circle cx="200" cy="560" r="180" fill="#ff6300" fill-opacity="0.07"/>
  <text x="640" y="240" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#ff8a00" letter-spacing="3">KAPUNTER CUSTOMER GUIDE</text>
  <text x="640" y="340" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="700" fill="#fff3e5">Module ${esc(mod.number)}</text>
  <text x="640" y="410" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="#ffcc9f">${esc(mod.title)}</text>
  <rect x="540" y="440" width="200" height="5" rx="3" fill="url(#accent)"/>
  <text x="640" y="510" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#b8a992">Watch on Kapunter.com — no redirect</text>
</svg>`;
}

function sceneSvg(mod, scene, index, total) {
  const narrLines = wrapText(scene.narr, 54);
  const bullets = scene.lines
    .map((line, i) => {
      const y = 268 + i * 54;
      return `
      <rect x="430" y="${y - 28}" width="420" height="44" rx="10" fill="#1c1826" stroke="#ff8a00" stroke-opacity="0.25"/>
      <circle cx="454" cy="${y - 6}" r="5" fill="#ff8a00"/>
      <text x="474" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#ffcc9f">${esc(line)}</text>`;
    })
    .join('');
  const narr = narrLines
    .map((line, i) => `<text x="80" y="${560 + i * 28}" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#b8a992">${esc(line)}</text>`)
    .join('');
  const progress = Math.round((1120 * (index + 1)) / total);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09070e"/>
      <stop offset="55%" stop-color="#15121d"/>
      <stop offset="100%" stop-color="#1c1826"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff8a00"/>
      <stop offset="100%" stop-color="#ff6300"/>
    </linearGradient>
    <linearGradient id="phone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1524"/>
      <stop offset="100%" stop-color="#100e16"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1100" cy="80" r="220" fill="#ff8a00" fill-opacity="0.08"/>
  <circle cx="160" cy="640" r="180" fill="#ff6300" fill-opacity="0.06"/>

  <text x="80" y="70" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#ff8a00">KAPUNTER</text>
  <text x="80" y="104" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#b8a992">Customer guide · Module ${esc(mod.number)}</text>

  <text x="80" y="170" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="700" fill="#fff3e5">${esc(mod.title)}</text>
  <rect x="80" y="190" width="120" height="4" rx="2" fill="url(#accent)"/>

  <rect x="400" y="150" width="480" height="370" rx="28" fill="url(#phone)" stroke="#ff8a00" stroke-opacity="0.35" stroke-width="2"/>
  <rect x="400" y="150" width="480" height="52" rx="28" fill="#ff8a00" fill-opacity="0.12"/>
  <rect x="400" y="178" width="480" height="24" fill="#ff8a00" fill-opacity="0.12"/>
  <text x="430" y="184" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff3e5">Kapunter</text>
  <rect x="690" y="164" width="150" height="28" rx="14" fill="#ff8a00" fill-opacity="0.15" stroke="#ff8a00" stroke-opacity="0.4"/>
  <text x="765" y="183" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#ff8a00">${esc(scene.status.toUpperCase())}</text>

  <text x="430" y="240" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#fff3e5">${esc(scene.title)}</text>
  ${bullets}

  <rect x="0" y="530" width="${W}" height="190" fill="#0c0a12" fill-opacity="0.92"/>
  <text x="80" y="520" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#ff8a00">STEP ${index + 1} / ${total}</text>
  ${narr}

  <rect x="80" y="660" width="1120" height="8" rx="4" fill="#fff3e5" fill-opacity="0.12"/>
  <rect x="80" y="660" width="${progress}" height="8" rx="4" fill="url(#accent)"/>
</svg>`;
}

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
    /* search */
  }
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (existsSync(base)) {
    for (const d of readdirSync(base).filter(x => x.toLowerCase().includes('ffmpeg'))) {
      const root = path.join(base, d);
      for (const sub of readdirSync(root)) {
        const bin = path.join(root, sub, 'bin', 'ffmpeg.exe');
        if (existsSync(bin)) return bin;
      }
    }
  }
  throw new Error('ffmpeg not found');
}

async function svgToPng(ffmpeg, svgPath, pngPath) {
  // Prefer Inkscape-less path: ImageMagick, then ffmpeg SVG, then PowerShell rasterize
  try {
    await run(ffmpeg, ['-y', '-width', String(W), '-height', String(H), '-i', svgPath, pngPath]);
    await access(pngPath);
    return;
  } catch {
    /* fallback */
  }

  // PowerShell + System.Drawing / Windows Imaging for SVG is limited.
  // Use ffmpeg lavfi + ass-like approach via converting SVG with Edge/Chromium headless if available.
  throw new Error(`Could not rasterize ${svgPath}`);
}

async function rasterizeWithChrome(svgPath, pngPath) {
  const candidates = [
    path.join(process.env['PROGRAMFILES'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env['PROGRAMFILES'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
  ].filter(existsSync);

  if (!candidates.length) throw new Error('No Chrome/Edge found for SVG rasterize');

  const browser = candidates[0];
  const fileUrl = 'file:///' + svgPath.replace(/\\/g, '/');
  // headless screenshot of SVG file
  await run(browser, [
    '--headless=new',
    '--disable-gpu',
    `--screenshot=${pngPath}`,
    `--window-size=${W},${H}`,
    '--hide-scrollbars',
    '--default-background-color=00000000',
    fileUrl
  ]);
  await access(pngPath);
}

async function makePng(ffmpeg, svgPath, pngPath) {
  try {
    await svgToPng(ffmpeg, svgPath, pngPath);
  } catch {
    await rasterizeWithChrome(svgPath, pngPath);
  }
}

async function buildModule(ffmpeg, mod) {
  const dir = path.join(WORK, mod.file.replace('.mp4', ''));
  await mkdir(dir, { recursive: true });
  const frames = [];

  const introSvgPath = path.join(dir, 'intro.svg');
  const introPng = path.join(dir, 'frame-000.png');
  await writeFile(introSvgPath, introSvg(mod), 'utf8');
  await makePng(ffmpeg, introSvgPath, introPng);
  frames.push({ file: introPng, duration: INTRO_SEC });

  for (let i = 0; i < mod.scenes.length; i++) {
    const svgPath = path.join(dir, `scene-${i}.svg`);
    const png = path.join(dir, `frame-${String(i + 1).padStart(3, '0')}.png`);
    await writeFile(svgPath, sceneSvg(mod, mod.scenes[i], i, mod.scenes.length), 'utf8');
    await makePng(ffmpeg, svgPath, png);
    frames.push({ file: png, duration: SCENE_SEC });
  }

  const listPath = path.join(dir, 'list.txt');
  // concat demuxer needs forward slashes; escape single quotes in path
  const listBody =
    frames
      .map(f => {
        const p = f.file.replace(/\\/g, '/').replace(/'/g, "'\\''");
        return `file '${p}'\nduration ${f.duration}`;
      })
      .join('\n') +
    `\nfile '${frames[frames.length - 1].file.replace(/\\/g, '/')}'\n`;
  await writeFile(listPath, listBody, 'utf8');

  const out = path.join(OUT_DIR, mod.file);
  await run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-vf', `fps=${FPS},format=yuv420p`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    out
  ]);
  console.log(`✓ ${mod.file}`);
}

async function main() {
  const ffmpeg = await findFfmpeg();
  console.log('Using ffmpeg:', ffmpeg);
  await mkdir(OUT_DIR, { recursive: true });
  await rm(WORK, { recursive: true, force: true });
  await mkdir(WORK, { recursive: true });

  for (const mod of MODULES) {
    console.log(`Building ${mod.file}…`);
    await buildModule(ffmpeg, mod);
  }

  await rm(WORK, { recursive: true, force: true });
  console.log('Done. Videos in', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
