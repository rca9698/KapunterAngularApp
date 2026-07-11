/**
 * Minimal build-time fallbacks. Runtime config:
 * - assets/app-config.json → apiUrl, isAdminSite, appUrl
 * - GET /api/Config/GetPublicConfig → imagePath, whatsapp
 */
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
