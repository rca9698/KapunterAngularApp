const fs = require('fs');
const path = require('path');

const src = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!fs.existsSync(src)) {
  console.error('APK not found. Build first with: npm run android:apk');
  process.exit(1);
}

const destDir = path.join('src', 'assets', 'app');
const releaseDir = path.join('..', 'releases');
const distDir = path.join('dist', 'kapunter.client', 'assets', 'app');

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(releaseDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

const hosted = path.join(destDir, 'kapunter.apk');
const release = path.join(releaseDir, 'Kapunter-debug.apk');
const distApk = path.join(distDir, 'kapunter.apk');

fs.copyFileSync(src, hosted);
fs.copyFileSync(src, release);
fs.copyFileSync(src, distApk);

console.log('Hosted download path:', hosted);
console.log('Release copy:', release);
console.log('Dist copy (deploy this):', distApk);
console.log('Public URL after deploy: https://kapunter.com/assets/app/kapunter.apk');
