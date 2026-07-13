/** Production build fallbacks — apiUrl from app-config.json (https://api.kapunter.com). */
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
    defaultMessage: ''
  }
};
