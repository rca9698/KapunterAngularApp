const fs = require('fs');
const path = require('path');

const candidates = [
  path.join('android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'app', 'kapunter.apk'),
  path.join('android', 'app', 'build', 'intermediates', 'assets', 'debug', 'public', 'assets', 'app', 'kapunter.apk'),
];

for (const file of candidates) {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log('Removed embedded APK from Android assets:', file);
    }
  } catch (err) {
    console.warn('Could not remove', file, err.message);
  }
}
