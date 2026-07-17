const fs = require('fs');
const path = require('path');

const src = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!fs.existsSync(src)) {
  console.error('APK not found. Build first with: npm run android:apk');
  process.exit(1);
}

const gradlePath = path.join('android', 'app', 'build.gradle');
const gradle = fs.readFileSync(gradlePath, 'utf8');
const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
const versionNameMatch = gradle.match(/versionName\s+"([^"]+)"/);
const versionCode = Number(versionCodeMatch?.[1] || 1);
const versionName = String(versionNameMatch?.[1] || '1.0');

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

const publicBase = 'https://kapunter.com/';
const manifest = {
  versionCode,
  versionName,
  apkUrl: `${publicBase}assets/app/kapunter.apk`,
  minVersionCode: 1,
  forceUpdate: false,
  releaseNotes: `Kapunter ${versionName} is ready. Update for the latest fixes and features.`,
  publishedAt: new Date().toISOString(),
};

const manifestSrc = path.join(destDir, 'android-version.json');
const manifestDist = path.join(distDir, 'android-version.json');
fs.writeFileSync(manifestSrc, JSON.stringify(manifest, null, 2));
fs.writeFileSync(manifestDist, JSON.stringify(manifest, null, 2));

console.log('Hosted download path:', hosted);
console.log('Version manifest:', manifestSrc);
console.log('Release copy:', release);
console.log('Dist copy (deploy this):', distApk);
console.log(`Published version: ${versionName} (${versionCode})`);
console.log('Public URL after deploy: https://kapunter.com/assets/app/kapunter.apk');
console.log('Version URL after deploy: https://kapunter.com/assets/app/android-version.json');
