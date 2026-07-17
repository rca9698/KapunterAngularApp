# Hosted Android APK + in-app updates
#
# After `npm run android:apk` + `npm run android:publish-apk`, this folder contains:
# - kapunter.apk
# - android-version.json  (read by the native app on open)
#
# Public URLs:
#   https://kapunter.com/assets/app/kapunter.apk
#   https://kapunter.com/assets/app/android-version.json
#
# Release steps:
# 1. Bump versionCode (+1) and versionName in android/app/build.gradle
# 2. npm run android:apk
# 3. npm run android:publish-apk
# 4. Deploy dist/kapunter.client (includes APK + version JSON)
#
# Installed apps (with the updater) compare local versionCode to android-version.json
# and prompt to download + reinstall when a newer build is available.
