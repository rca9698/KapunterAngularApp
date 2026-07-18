/** Central place for public Kapunter links and brand facts used across the site. */
export interface BrandInfo {
  name: string;
  foundedYear: number;
  appUrl: string;
  apkUrl: string;
  whatsappUrl: string;
  email: string;
}

export const BRAND: BrandInfo = {
  name: 'Kapunter',
  foundedYear: 2017,
  appUrl: 'https://kapunter.com/',
  apkUrl: 'https://kapunter.com/assets/app/kapunter.apk',
  whatsappUrl: 'https://wa.me/',
  email: 'support@kapunter.com'
};

export const YEARS_IN_SERVICE = new Date().getFullYear() - BRAND.foundedYear;
