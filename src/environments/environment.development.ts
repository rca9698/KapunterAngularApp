/** Dev build fallbacks — set apiUrl in assets/app-config.json for local API. */
export const environment = {
  production: false,
  environment: 'dev',
  isAdminSite: false,
  appUrl: '',
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
    defaultMessage: ''
  }
};
