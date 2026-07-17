/** Dev build fallbacks — apiUrl from app-config.development.json (https://localhost:7236). */
export const environment = {
  production: false,
  environment: 'dev',
  isAdminSite: false,
  appUrl: 'https://kapunter.com/',
  apiUrl: 'https://localhost:7236',
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
