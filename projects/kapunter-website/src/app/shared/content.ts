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

/** Customer-facing module guides shown on the website (not admin). */
export interface GuideScene {
  title: string;
  narration: string;
  screenTitle: string;
  screenLines: string[];
  status?: string;
}

export interface GuideModule {
  id: string;
  number: string;
  title: string;
  summary: string;
  icon: string;
  durationLabel: string;
  /** Optional local MP4 under assets/videos — plays on-site, never redirects. */
  videoSrc?: string;
  /** Language variants: en / hi / kn */
  videoSrcByLang?: Partial<Record<'en' | 'hi' | 'kn', string>>;
  scenes: GuideScene[];
}

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: 'create-id',
    number: '01',
    title: 'Create a gaming ID',
    summary: 'Fill the create-ID form, submit your request, and let Kapunter admin approve and create the account for you.',
    icon: '🆔',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/01-create-id.mp4',
    videoSrcByLang: {
      en: 'assets/videos/01-create-id-en.mp4',
      hi: 'assets/videos/01-create-id-hi.mp4',
      kn: 'assets/videos/01-create-id-kn.mp4'
    },
    scenes: [
      {
        title: 'Open Create ID',
        narration: 'From your Kapunter home, tap Create ID to start a new gaming account request.',
        screenTitle: 'Create ID',
        screenLines: ['Choose preferred site', 'Enter name & mobile', 'Set deposit amount'],
        status: 'Ready'
      },
      {
        title: 'Add your details',
        narration: 'Enter the required details for the site ID you want. Double-check spelling before you continue.',
        screenTitle: 'ID request form',
        screenLines: ['Site: selected', 'Player name: filled', 'Mobile: verified'],
        status: 'Editing'
      },
      {
        title: 'Submit the request',
        narration: 'Tap Submit. Your request goes to Kapunter admin — you do not create the site login yourself.',
        screenTitle: 'Submit request',
        screenLines: ['Review summary', 'Confirm amount', 'Submit for approval'],
        status: 'Pending'
      },
      {
        title: 'Admin creates your ID',
        narration: 'Admin reviews, approves, and creates the ID/account. You get notified when credentials are ready.',
        screenTitle: 'Request tracking',
        screenLines: ['Status: Under review', 'Admin processing…', 'You will be notified'],
        status: 'In progress'
      }
    ]
  },
  {
    id: 'bank-details',
    number: '02',
    title: 'Add bank details',
    summary: 'Save your bank / UPI details once so withdrawals can be paid out quickly and securely.',
    icon: '🏦',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/02-bank-details.mp4',
    videoSrcByLang: {
      en: 'assets/videos/02-bank-details-en.mp4',
      hi: 'assets/videos/02-bank-details-hi.mp4',
      kn: 'assets/videos/02-bank-details-kn.mp4'
    },
    scenes: [
      {
        title: 'Open bank section',
        narration: 'Go to your bank / payment details area from the customer menu.',
        screenTitle: 'My bank details',
        screenLines: ['Add bank account', 'Add UPI', 'Add QR (optional)'],
        status: 'Setup'
      },
      {
        title: 'Enter account info',
        narration: 'Add account holder name, account number, IFSC and bank name — or your UPI ID.',
        screenTitle: 'Add bank account',
        screenLines: ['Account holder', 'Account number', 'IFSC + bank name'],
        status: 'Editing'
      },
      {
        title: 'Save for withdrawals',
        narration: 'Save the details. Kapunter uses them when you request a withdrawal so payouts stay fast.',
        screenTitle: 'Saved successfully',
        screenLines: ['Primary account set', 'Ready for withdrawals', 'Edit anytime from list'],
        status: 'Active'
      }
    ]
  },
  {
    id: 'manage-id',
    number: '03',
    title: 'Use your ID after approval',
    summary: 'Once your ID is live: deposit, transfer coins, withdraw, view ID data, check history, or remove the ID.',
    icon: '🎮',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/03-manage-id.mp4',
    videoSrcByLang: {
      en: 'assets/videos/03-manage-id-en.mp4',
      hi: 'assets/videos/03-manage-id-hi.mp4',
      kn: 'assets/videos/03-manage-id-kn.mp4'
    },
    scenes: [
      {
        title: 'ID is ready',
        narration: 'After admin approval, open My IDs to see your live gaming ID and actions.',
        screenTitle: 'My IDs',
        screenLines: ['ID active', 'Site credentials ready', 'Choose an action'],
        status: 'Active'
      },
      {
        title: 'Deposit coins',
        narration: 'Deposit coins to your Kapunter wallet, then move them toward the ID when you are ready to play.',
        screenTitle: 'Deposit',
        screenLines: ['UPI / bank / QR', 'Enter amount', 'Confirm payment'],
        status: 'Wallet+'
      },
      {
        title: 'Transfer to ID',
        narration: 'Transfer wallet coins to your gaming ID so you can play on the selected site.',
        screenTitle: 'Transfer to ID',
        screenLines: ['Select ID', 'Enter coins', 'Submit transfer'],
        status: 'Transferred'
      },
      {
        title: 'Withdraw winnings',
        narration: 'Withdraw from the ID back to your Kapunter wallet, then request payout to your saved bank details.',
        screenTitle: 'Withdraw',
        screenLines: ['From ID → wallet', 'Wallet → bank / UPI', '45-min payout SLA'],
        status: 'Payout'
      },
      {
        title: 'View ID & history',
        narration: 'View ID data anytime and open transaction history for every deposit, transfer and withdraw.',
        screenTitle: 'ID details',
        screenLines: ['View credentials', 'Transaction history', 'Request statuses'],
        status: 'History'
      },
      {
        title: 'Remove ID',
        narration: 'When you no longer need an ID, submit Remove ID. Admin closes it and the record moves to closed IDs.',
        screenTitle: 'Remove ID',
        screenLines: ['Select ID to close', 'Confirm request', 'Admin completes closure'],
        status: 'Closing'
      }
    ]
  },
  {
    id: 'change-password',
    number: '04',
    title: 'Change password',
    summary: 'Open My Account to update your Kapunter login password whenever you need a security refresh.',
    icon: '🔐',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/04-change-password.mp4',
    videoSrcByLang: {
      en: 'assets/videos/04-change-password-en.mp4',
      hi: 'assets/videos/04-change-password-hi.mp4',
      kn: 'assets/videos/04-change-password-kn.mp4'
    },
    scenes: [
      {
        title: 'Go to My Account',
        narration: 'Open My Account from the menu to manage your Kapunter profile and security.',
        screenTitle: 'My Account',
        screenLines: ['Profile overview', 'Security settings', 'Change password'],
        status: 'Account'
      },
      {
        title: 'Update password',
        narration: 'Enter your current password, then set and confirm a new strong password.',
        screenTitle: 'Change password',
        screenLines: ['Current password', 'New password', 'Confirm new password'],
        status: 'Secure'
      },
      {
        title: 'Password updated',
        narration: 'Save the change. Use the new password on your next login — keep it private.',
        screenTitle: 'Success',
        screenLines: ['Password changed', 'Session secured', 'Login with new password'],
        status: 'Done'
      }
    ]
  },
  {
    id: 'passbook',
    number: '05',
    title: 'Passbook & live trace',
    summary: 'Open Passbook for a clear wallet ledger, and use live trace to follow open requests in real time.',
    icon: '📒',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/05-passbook.mp4',
    videoSrcByLang: {
      en: 'assets/videos/05-passbook-en.mp4',
      hi: 'assets/videos/05-passbook-hi.mp4',
      kn: 'assets/videos/05-passbook-kn.mp4'
    },
    scenes: [
      {
        title: 'Open Passbook',
        narration: 'Passbook shows every wallet movement — deposits, withdrawals, bonuses and ID-related coin activity.',
        screenTitle: 'Passbook',
        screenLines: ['Wallet balance', 'Credit / debit rows', 'Date filters'],
        status: 'Ledger'
      },
      {
        title: 'Read each entry',
        narration: 'Tap a row to see amount, type, reference and when it was processed — full transparency.',
        screenTitle: 'Entry detail',
        screenLines: ['Type · amount', 'Reference ID', 'Processed time'],
        status: 'Detail'
      },
      {
        title: 'Live request trace',
        narration: 'Live trace follows open deposit, withdraw and ID requests step-by-step until they complete.',
        screenTitle: 'Live trace',
        screenLines: ['Submitted', 'Admin reviewing', 'Completed / paid'],
        status: 'Live'
      }
    ]
  },
  {
    id: 'notifications',
    number: '06',
    title: 'Notifications',
    summary: 'Stay updated when IDs are approved, deposits land, withdrawals pay out, or support needs your attention.',
    icon: '🔔',
    durationLabel: '~1 min',
    videoSrc: 'assets/videos/06-notifications.mp4',
    videoSrcByLang: {
      en: 'assets/videos/06-notifications-en.mp4',
      hi: 'assets/videos/06-notifications-hi.mp4',
      kn: 'assets/videos/06-notifications-kn.mp4'
    },
    scenes: [
      {
        title: 'Open notifications',
        narration: 'Tap the bell to see alerts about your ID requests, wallet activity and account messages.',
        screenTitle: 'Notifications',
        screenLines: ['Unread alerts', 'ID & wallet updates', 'System messages'],
        status: 'Inbox'
      },
      {
        title: 'Act on an alert',
        narration: 'Open a notification to jump straight to the related request, passbook entry or ID screen.',
        screenTitle: 'Alert detail',
        screenLines: ['ID approved', 'Withdrawal paid', 'Open related screen'],
        status: 'Action'
      },
      {
        title: 'Stay in the loop',
        narration: 'Keep notifications enabled so you never miss admin approvals or payout confirmations.',
        screenTitle: 'All caught up',
        screenLines: ['Mark as read', 'Clear old alerts', '24×7 updates'],
        status: 'Synced'
      }
    ]
  }
];
