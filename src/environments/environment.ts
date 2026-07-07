export const environment = {
    production: true,
    environment: 'prod',
    isAdminSite: false,
    appUrl: 'https://kapunter.com/',
    apiUrl: 'https://kapunter-api.azurewebsites.net',
    ueserKey: 'kapunterUser',

    imagePath:{
        sitePath:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/Sites/',
        dashboardImages:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/DashboardImages/',
        QR:'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/QR/',
        proofPath: 'https://kapunterappstorage.blob.core.windows.net/kapunterstorage/PaymentProof/'
    },

    whatsapp: {
        enabled: true,
        phoneNumber: '919740517052',
        defaultMessage: 'Hi, I need help with Kapunter'
    }
};
