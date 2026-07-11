/**
 * ng serve fallbacks. For local API, set apiUrl in src/assets/app-config.json
 * (e.g. "https://localhost:7236") — no rebuild needed after that edit + refresh.
 */
export const environment = {
    production: false,
    environment: 'dev',
    isAdminSite: false,
    appUrl: 'https://kapunter.com/',
    apiUrl: 'https://localhost:7236',
    ueserKey: 'kapunterUser',

    imagePath:{
        sitePath:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/Sites/',
        dashboardImages:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/DashboardImages/',
        QR:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/QR/',
        proofPath: 'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/PaymentProof/'
    },

    whatsapp: {
        enabled: true,
        phoneNumber: '91',
        defaultMessage: 'Hi, I need help with Kapunter'
    }
};
