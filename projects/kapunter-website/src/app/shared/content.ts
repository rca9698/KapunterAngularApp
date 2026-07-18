/** Static marketing content. Ready to swap for API-driven data later. */

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  quote: string;
  tag: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: '⚡',
    title: '45-Minute Withdrawal Guarantee',
    description: 'Request a withdrawal and receive your funds within 45 minutes — a promise backed by years of consistent delivery.'
  },
  {
    icon: '🆔',
    title: 'Multi-Site Gaming IDs',
    description: 'Create, manage, transfer and close IDs across trusted gaming sites — all from one secure Kapunter wallet.'
  },
  {
    icon: '💰',
    title: 'Instant Deposits',
    description: 'Top up via UPI, bank transfer or QR in seconds. Your coins appear in the wallet the moment payment is confirmed.'
  },
  {
    icon: '🎁',
    title: '3% Lossback Program',
    description: 'Play with confidence. Kapunter returns 3% of your net losses as wallet credit — automatic and transparent.'
  },
  {
    icon: '🤝',
    title: 'Refer & Earn Rewards',
    description: 'Share your unique referral link and earn wallet rewards every time a friend joins and plays through Kapunter.'
  },
  {
    icon: '📱',
    title: 'Android App + Web Access',
    description: 'Use Kapunter on any browser, or download the official Android APK for a faster, native experience on the go.'
  },
  {
    icon: '💬',
    title: '24×7 WhatsApp Support',
    description: 'Real humans, not bots. Our support team is available around the clock on WhatsApp for deposits, withdrawals and ID help.'
  },
  {
    icon: '📒',
    title: 'Full Passbook & History',
    description: 'Every deposit, withdrawal, transfer and bonus is recorded. Track your wallet and ID activity with complete transparency.'
  },
  {
    icon: '🔐',
    title: 'OTP Secure Login',
    description: 'Mobile-number login with OTP or password. Your account security is treated as a first-class product feature.'
  }
];

export const HIGHLIGHTS: FeatureItem[] = FEATURES.slice(0, 6);

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rahul S.',
    city: 'Mumbai',
    rating: 5,
    tag: 'Fast Payouts',
    quote: 'I have been with Kapunter since 2019. Withdrawals land within the promised 45 minutes every single time. That reliability is why I never switched.'
  },
  {
    name: 'Priya M.',
    city: 'Pune',
    rating: 5,
    tag: 'Easy IDs',
    quote: 'Creating and managing gaming IDs used to be a headache. Kapunter made the whole process simple — deposit, create ID, play. Support is always available on WhatsApp.'
  },
  {
    name: 'Amit K.',
    city: 'Delhi',
    rating: 5,
    tag: 'Lossback Fan',
    quote: 'The 3% lossback actually shows up in my wallet. Combined with referral rewards, Kapunter feels like a platform that genuinely looks after its players.'
  },
  {
    name: 'Sneha R.',
    city: 'Bengaluru',
    rating: 5,
    tag: 'Trusted Since Day One',
    quote: 'My brother introduced me to Kapunter in 2018. Years later, it is still the cleanest, fastest wallet platform I use. Transparent passbook and zero surprises.'
  },
  {
    name: 'Vikram D.',
    city: 'Ahmedabad',
    rating: 5,
    tag: 'Android App',
    quote: 'The Android APK is smooth and notifications keep me updated on every request. Deposits via UPI are instant. Highly recommended for serious players.'
  },
  {
    name: 'Neha T.',
    city: 'Hyderabad',
    rating: 5,
    tag: 'Great Support',
    quote: 'Had a password-change request late at night — WhatsApp support resolved it in minutes. That kind of service keeps me loyal to Kapunter.'
  }
];

export const FAQS: FaqItem[] = [
  {
    question: 'What is Kapunter?',
    answer: 'Kapunter is an online gaming ID and wallet management platform. We help players create and manage IDs on trusted gaming sites, move funds securely, and track every transaction — with instant deposits and a 45-minute withdrawal guarantee.'
  },
  {
    question: 'How fast are withdrawals?',
    answer: 'Kapunter guarantees withdrawals within 45 minutes of a valid request. Our operations team processes payouts around the clock so you are never left waiting.'
  },
  {
    question: 'How do I deposit coins?',
    answer: 'Log in to Kapunter, choose your preferred payment method (UPI, bank transfer or QR), complete the payment and your wallet is credited as soon as confirmation is received — usually within seconds.'
  },
  {
    question: 'What is the 3% Lossback program?',
    answer: 'Eligible players receive 3% of their net losses back as Kapunter wallet credit. Lossback is designed to reward loyalty and reduce the sting of a tough session — details are available inside the app under Loss Back.'
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes. Kapunter is available as a progressive web experience at kapunter.com and as an official Android APK that you can download directly from the site. In-app updates keep you on the latest version.'
  },
  {
    question: 'How do I get support?',
    answer: 'Reach us 24×7 on WhatsApp from inside the Kapunter app, or use the Contact page on this website. Our team assists with deposits, withdrawals, ID creation, password changes and account queries.'
  },
  {
    question: 'Who can use Kapunter?',
    answer: 'Kapunter is intended only for adults aged 18 years and above. Users must play responsibly and comply with the applicable laws of their jurisdiction.'
  },
  {
    question: 'How does Refer & Earn work?',
    answer: 'Share your unique referral link. When a friend registers through it and meets the reward criteria, both of you receive wallet rewards. Track referrals and earnings from the Refer & Earn section in the app.'
  }
];

export const STATS = [
  { value: '2017', label: 'Founded' },
  { value: '45 min', label: 'Withdrawal Guarantee' },
  { value: '3%', label: 'Lossback Reward' },
  { value: '24×7', label: 'WhatsApp Support' }
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Register with your mobile number using OTP. Secure login takes under a minute.'
  },
  {
    step: '02',
    title: 'Deposit to your wallet',
    description: 'Add coins via UPI, bank or QR. Funds reflect instantly after confirmation.'
  },
  {
    step: '03',
    title: 'Get your gaming ID',
    description: 'Request an ID on your preferred site. Kapunter creates and delivers credentials securely.'
  },
  {
    step: '04',
    title: 'Play & withdraw anytime',
    description: 'Transfer coins to your ID, enjoy the game, and withdraw winnings within 45 minutes.'
  }
];
