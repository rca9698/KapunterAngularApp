/**
 * Default / production fallbacks.
 * Runtime: assets/app-config.json overrides apiUrl (prod → https://api.kapunter.com).
 * Dev serve/build replaces this file and app-config with the development variants.
 */
export const environment = {
  production: true,
  environment: 'prod',
  isAdminSite: false,
  appUrl: 'https://kapunter.com/',
  apiUrl: 'https://api.kapunter.com',
  ueserKey: 'kapunterUser',
  imagePath: {
    sitePath: '',
    dashboardImages: '',
    QR: '',
    proofPath: ''
  },
  whatsapp: {
    enabled: false,
    phoneNumber: '',
    defaultMessage: '',
    numbers: [] as Array<{ phoneNumber: string; label: string; active: boolean }>
  }
};
