/** Production build fallbacks — prefer app-config.json + GetPublicConfig. */
export const environment = {
  production: true,
  environment: 'prod',
  isAdminSite: false,
  appUrl: '',
  apiUrl: '',
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
