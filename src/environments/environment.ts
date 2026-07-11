/**
 * Build-time fallbacks only.
 * Deploy URLs / isAdminSite come from assets/app-config.json (AppConfigService).
 * imagePath / whatsapp are loaded from DB via GET /api/Config/GetPublicConfig on startup.
 * WhatsApp is managed in Admin → Utility (DB AppSetting); keep empty fallbacks only.
 */
export const environment = {
    production: true,
    environment: 'prod',
    isAdminSite: false,
    appUrl: 'https://kapunter.com/',
    apiUrl: 'https://localhost:7236',
    ueserKey: 'kapunterUser',
 
};
