import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kapunter.app',
  appName: 'KAPUNTER',
  webDir: 'dist/kapunter.client',
  server: {
    // Use https scheme so Angular assets and cookies behave like production web.
    androidScheme: 'https',
  },
  plugins: {
    // Native HTTP bypasses WebView CORS so api.kapunter.com works from the APK.
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
