/**
 * Polished multi-language Kapunter customer guide videos.
 * EN / HI / KN audio + arrow highlights on real UI.
 *
 * Env: KAPUNTER_MOBILE, KAPUNTER_PASSWORD
 * Optional: KAPUNTER_MODULES, KAPUNTER_USERNAME
 */
const { test, expect } = require('@playwright/test');
const {
  EDGE,
  injectPrivacyCss,
  clearGuideUi,
  pointAt,
  teachCard,
  snap,
  loginQuiet,
  prepareWork,
  finishModule,
  closeModal,
  OUT_DIR,
} = require('./record-helpers.cjs');

test.use({
  viewport: { width: 1280, height: 720 },
  launchOptions: { executablePath: EDGE },
});

const N = {
  create: [
    {
      en: 'Welcome to Kapunter Create ID guide. Follow the orange arrow on each step.',
      hi: 'कपंटर क्रिएट आईडी गाइड में आपका स्वागत है। हर चरण पर नारंगी तीर का पालन करें।',
      kn: 'ಕಪುಂಟರ್ ಕ್ರಿಯೇಟ್ ಐಡಿ ಮಾರ್ಗದರ್ಶಿಗೆ ಸ್ವಾಗತ. ಪ್ರತಿ ಹಂತದಲ್ಲಿ ಕಿತ್ತಳೆ ಬಾಣವನ್ನು ಅನುಸರಿಸಿ.',
    },
    {
      en: 'Tap Login Signup, then enter your mobile number. Only the first four digits are shown for privacy.',
      hi: 'लॉगिन साइनअप पर टैप करें, फिर अपना मोबाइल नंबर दर्ज करें। गोपनीयता के लिए केवल पहले चार अंक दिखते हैं।',
      kn: 'ಲಾಗಿನ್ ಸೈನ್ ಅಪ್ ಟ್ಯಾಪ್ ಮಾಡಿ, ನಂತರ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ. ಗೌಪ್ಯತೆಗಾಗಿ ಮೊದಲ ನಾಲ್ಕು ಅಂಕಿಗಳು ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ.',
    },
    {
      en: 'Choose Password login. Your password stays hidden.',
      hi: 'पासवर्ड लॉगिन चुनें। आपका पासवर्ड छिपा रहता है।',
      kn: 'ಪಾಸ್‌ವರ್ಡ್ ಲಾಗಿನ್ ಆಯ್ಕೆಮಾಡಿ. ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಲಾಗುತ್ತದೆ.',
    },
    {
      en: 'Open IDs, then Create ID. Pick a platform that has no active ID yet.',
      hi: 'आईडी खोलें, फिर क्रिएट आईडी। ऐसी साइट चुनें जिसकी एक्टिव आईडी अभी नहीं है।',
      kn: 'ಐಡಿಗಳನ್ನು ತೆರೆಯಿರಿ, ನಂತರ ಕ್ರಿಯೇಟ್ ಐಡಿ. ಇನ್ನೂ ಸಕ್ರಿಯ ಐಡಿ ಇಲ್ಲದ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಯ್ಕೆಮಾಡಿ.',
    },
    {
      en: 'Tap Create ID on your chosen site. The arrow shows exactly where to click.',
      hi: 'अपनी चुनी हुई साइट पर क्रिएट आईडी टैप करें। तीर दिखाता है कहाँ क्लिक करना है।',
      kn: 'ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಸೈಟ್‌ನಲ್ಲಿ ಕ್ರಿಯೇಟ್ ಐಡಿ ಟ್ಯಾಪ್ ಮಾಡಿ. ಬಾಣ ಎಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಬೇಕು ಎಂದು ತೋರಿಸುತ್ತದೆ.',
    },
    {
      en: 'Type the username you want. Only the first letter is shown in this guide.',
      hi: 'जो यूज़रनेम चाहिए वो लिखें। इस गाइड में केवल पहला अक्षर दिखता है।',
      kn: 'ನೀವು ಬಯಸುವ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ. ಈ ಮಾರ್ಗದರ್ಶಿಯಲ್ಲಿ ಮೊದಲ ಅಕ್ಷರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ.',
    },
    {
      en: 'Tap Create ID to submit. Admin will approve and create the account for you.',
      hi: 'सबमिट करने के लिए क्रिएट आईडी टैप करें। एडमिन अप्रूव करके आपके लिए अकाउंट बनाएगा।',
      kn: 'ಸಲ್ಲಿಸಲು ಕ್ರಿಯೇಟ್ ಐಡಿ ಟ್ಯಾಪ್ ಮಾಡಿ. ಅಡ್ಮಿನ್ ಅನುಮೋದಿಸಿ ನಿಮಗಾಗಿ ಖಾತೆ ರಚಿಸುತ್ತಾರೆ.',
    },
    {
      en: 'After approval your ID appears under My IDs. That completes Create ID.',
      hi: 'अप्रूवल के बाद आपकी आईडी माई आईडी में दिखेगी। क्रिएट आईडी पूरा।',
      kn: 'ಅನುಮೋದನೆಯ ನಂತರ ನಿಮ್ಮ ಐಡಿ ಮೈ ಐಡೀಸ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ. ಕ್ರಿಯೇಟ್ ಐಡಿ ಪೂರ್ಣ.',
    },
  ],
  bank: [
    {
      en: 'Bank details guide. Open Withdraw details from Your account menu.',
      hi: 'बैंक डिटेल्स गाइड। योर अकाउंट मेनू से विड्रॉ डिटेल्स खोलें।',
      kn: 'ಬ್ಯಾಂಕ್ ವಿವರಗಳ ಮಾರ್ಗದರ್ಶಿ. ಯುವರ್ ಅಕೌಂಟ್ ಮೆನುವಿನಿಂದ ವಿಥ್‌ಡ್ರಾ ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ.',
    },
    {
      en: 'Stay on the Bank tab. Tap Add bank to create withdrawal details.',
      hi: 'बैंक टैब पर रहें। विड्रॉ के लिए ऐड बैंक टैप करें।',
      kn: 'ಬ್ಯಾಂಕ್ ಟ್ಯಾಬ್‌ನಲ್ಲಿರಿ. ವಿತ್‌ಡ್ರಾಗಾಗಿ ಆಡ್ ಬ್ಯಾಂಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ.',
    },
    {
      en: 'Fill bank name, account holder, account number and IFSC. Sensitive numbers are masked here.',
      hi: 'बैंक नाम, अकाउंट होल्डर, अकाउंट नंबर और IFSC भरें। संवेदनशील नंबर यहाँ छिपे हैं।',
      kn: 'ಬ್ಯಾಂಕ್ ಹೆಸರು, ಖಾತೆದಾರ, ಖಾತೆ ಸಂಖ್ಯೆ ಮತ್ತು IFSC ಭರ್ತಿ ಮಾಡಿ. ಸೂಕ್ಷ್ಮ ಸಂಖ್ಯೆಗಳು ಇಲ್ಲಿ ಮರೆಮಾಡಲಾಗಿದೆ.',
    },
    {
      en: 'You can also add UPI from the UPI tab for faster payouts.',
      hi: 'तेज़ पेआउट के लिए यूपीआई टैब से यूपीआई भी जोड़ सकते हैं।',
      kn: 'ವೇಗದ ಪೇಔಟ್‌ಗಾಗಿ UPI ಟ್ಯಾಬ್‌ನಿಂದ UPI ಸಹ ಸೇರಿಸಬಹುದು.',
    },
    {
      en: 'Save your details once. Kapunter uses them whenever you withdraw.',
      hi: 'एक बार सेव करें। जब भी विड्रॉ करेंगे कपंटर इन्हीं डिटेल्स का उपयोग करेगा।',
      kn: 'ಒಮ್ಮೆ ಉಳಿಸಿ. ನೀವು ವಿತ್‌ಡ್ರಾ ಮಾಡಿದಾಗಲೆಲ್ಲಾ ಕಪುಂಟರ್ ಇವುಗಳನ್ನು ಬಳಸುತ್ತದೆ.',
    },
  ],
  manage: [
    {
      en: 'Welcome. After your ID is approved, open My IDs. Here you manage everything for that account.',
      hi: 'स्वागत है। आईडी अप्रूव होने के बाद माई आईडी खोलें। यहीं से आप उस अकाउंट की सारी चीज़ें मैनेज करते हैं।',
      kn: 'ಸ್ವಾಗತ. ನಿಮ್ಮ ಐಡಿ ಅನುಮೋದನೆಯ ನಂತರ ಮೈ ಐಡೀಸ್ ತೆರೆಯಿರಿ. ಇಲ್ಲಿಂದ ಆ ಖಾತೆಯ ಎಲ್ಲವನ್ನೂ ನಿರ್ವಹಿಸುತ್ತೀರಿ.',
    },
    {
      en: 'First, select your active ID card. We will use this account for the full walkthrough.',
      hi: 'पहले अपनी एक्टिव आईडी कार्ड चुनें। इसी अकाउंट पर पूरा डेमो दिखाएंगे।',
      kn: 'ಮೊದಲು ನಿಮ್ಮ ಸಕ್ರಿಯ ಐಡಿ ಕಾರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ. ಈ ಖಾತೆಯಲ್ಲಿ ಪೂರ್ಣ ಡೆಮೊ ತೋರಿಸುತ್ತೇವೆ.',
    },
    {
      en: 'On this card you will see Deposit, Withdraw, Transfer, My ID details, Transaction History, and Remove ID. Follow the orange arrow each time.',
      hi: 'इस कार्ड पर डिपॉज़िट, विड्रॉ, ट्रांसफर, माई आईडी डिटेल्स, ट्रांज़ैक्शन हिस्ट्री और रिमूव आईडी दिखेगा। हर बार नारंगी तीर देखें।',
      kn: 'ಈ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಡಿಪಾಸಿಟ್, ವಿತ್‌ಡ್ರಾ, ಟ್ರಾನ್ಸ್‌ಫರ್, ಮೈ ಐಡಿ ವಿವರಗಳು, ಟ್ರಾನ್ಸಾಕ್ಷನ್ ಇತಿಹಾಸ ಮತ್ತು ರಿಮೂವ್ ಐಡಿ ಕಾಣುತ್ತದೆ. ಪ್ರತಿ ಬಾರಿ ಕಿತ್ತಳೆ ಬಾಣವನ್ನು ನೋಡಿ.',
    },
  ],
  password: [
    {
      en: 'Change password guide. Open Profile under Your account.',
      hi: 'पासवर्ड बदलने की गाइड। योर अकाउंट में प्रोफाइल खोलें।',
      kn: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ ಮಾರ್ಗದರ್ಶಿ. ಯುವರ್ ಅಕೌಂಟ್‌ನಲ್ಲಿ ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ.',
    },
    {
      en: 'Tap Change Password. The orange arrow marks the button.',
      hi: 'चेंज पासवर्ड टैप करें। नारंगी तीर बटन दिखाता है।',
      kn: 'ಚೇಂಜ್ ಪಾಸ್‌ವರ್ಡ್ ಟ್ಯಾಪ್ ಮಾಡಿ. ಕಿತ್ತಳೆ ಬಾಣ ಬಟನ್ ತೋರಿಸುತ್ತದೆ.',
    },
    {
      en: 'Enter current password, then new password and confirm. All password fields stay hidden.',
      hi: 'वर्तमान पासवर्ड, फिर नया और कन्फर्म भरें। सभी पासवर्ड फ़ील्ड छिपे रहते हैं।',
      kn: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್, ನಂತರ ಹೊಸದು ಮತ್ತು ದೃಢೀಕರಣ ನಮೂದಿಸಿ. ಎಲ್ಲಾ ಪಾಸ್‌ವರ್ಡ್ ಕ್ಷೇತ್ರಗಳು ಮರೆಯಾಗಿರುತ್ತವೆ.',
    },
    {
      en: 'Save when ready. Use the new password on your next login.',
      hi: 'तैयार होने पर सेव करें। अगली लॉगिन पर नया पासवर्ड इस्तेमाल करें।',
      kn: 'ಸಿದ್ಧವಾದಾಗ ಉಳಿಸಿ. ಮುಂದಿನ ಲಾಗಿನ್‌ನಲ್ಲಿ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಬಳಸಿ.',
    },
  ],
  passbook: [
    {
      en: 'Passbook guide. Open Passbook to see every wallet and ID movement.',
      hi: 'पासबुक गाइड। हर वॉलेट और आईडी मूवमेंट देखने के लिए पासबुक खोलें।',
      kn: 'ಪಾಸ್‌ಬುಕ್ ಮಾರ್ಗದರ್ಶಿ. ಪ್ರತಿ ವಾಲೆಟ್ ಮತ್ತು ಐಡಿ ಚಲನೆ ನೋಡಲು ಪಾಸ್‌ಬುಕ್ ತೆರೆಯಿರಿ.',
    },
    {
      en: 'Browse entries for deposits, withdrawals, bonuses and ID activity.',
      hi: 'डिपॉज़िट, विड्रॉ, बोनस और आईडी एक्टिविटी की एंट्री देखें।',
      kn: 'ಡಿಪಾಸಿಟ್, ವಿತ್‌ಡ್ರಾ, ಬೋನಸ್ ಮತ್ತು ಐಡಿ ಚಟುವಟಿಕೆಯ ನಮೂದುಗಳನ್ನು ನೋಡಿ.',
    },
    {
      en: 'Tap Track for live request status — submitted, reviewing, completed.',
      hi: 'लाइव रिक्वेस्ट स्टेटस के लिए ट्रैक टैप करें — सबमिट, रिव्यू, पूरा।',
      kn: 'ಲೈವ್ ವಿನಂತಿ ಸ್ಥಿತಿಗಾಗಿ ಟ್ರ್ಯಾಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ — ಸಲ್ಲಿಸಲಾಗಿದೆ, ಪರಿಶೀಲನೆ, ಪೂರ್ಣ.',
    },
    {
      en: 'Use Passbook and live trace anytime for full transparency.',
      hi: 'पूरी पारदर्शिता के लिए पासबुक और लाइव ट्रेस कभी भी देखें।',
      kn: 'ಪೂರ್ಣ ಪಾರದರ್ಶಕತೆಗಾಗಿ ಯಾವಾಗಲೂ ಪಾಸ್‌ಬುಕ್ ಮತ್ತು ಲೈವ್ ಟ್ರೇಸ್ ಬಳಸಿ.',
    },
  ],
  notify: [
    {
      en: 'Notifications guide. Open Notifications to see alerts and updates.',
      hi: 'नोटिफिकेशन गाइड। अलर्ट और अपडेट देखने के लिए नोटिफिकेशन खोलें।',
      kn: 'ಅಧಿಸೂಚನೆಗಳ ಮಾರ್ಗದರ್ಶಿ. ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ನವೀಕರಣಗಳಿಗಾಗಿ ನೋಟಿಫಿಕೇಶನ್ ತೆರೆಯಿರಿ.',
    },
    {
      en: 'Unread items show a New badge. Tap one to open the related screen.',
      hi: 'अपठित आइटम पर न्यू बैज होता है। संबंधित स्क्रीन खोलने के लिए टैप करें।',
      kn: 'ಓದದ ಐಟಂಗಳಲ್ಲಿ ನ್ಯೂ ಬ್ಯಾಡ್ಜ್ ಇರುತ್ತದೆ. ಸಂಬಂಧಿತ ಸ್ಕ್ರೀನ್ ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ.',
    },
    {
      en: 'Stay notified for ID approvals, payouts and important announcements.',
      hi: 'आईडी अप्रूवल, पेआउट और जरूरी घोषणाओं के लिए नोटिफिकेशन चालू रखें।',
      kn: 'ಐಡಿ ಅನುಮೋದನೆ, ಪೇಔಟ್ ಮತ್ತು ಮುಖ್ಯ ಘೋಷಣೆಗಳಿಗಾಗಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಆನ್ ಇರಿಸಿ.',
    },
  ],
};

test('polished multi-language customer guides', async ({ page }) => {
  const mobile = process.env.KAPUNTER_MOBILE;
  const password = process.env.KAPUNTER_PASSWORD;
  const username = process.env.KAPUNTER_USERNAME || 'guideDemo';
  const selected = (process.env.KAPUNTER_MODULES || 'create-id,bank-details,manage-id,change-password,passbook,notifications')
    .split(',')
    .map(s => s.trim());

  if (!mobile || !password) throw new Error('Set KAPUNTER_MOBILE and KAPUNTER_PASSWORD');

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  await injectPrivacyCss(page);
  await loginQuiet(page, mobile, password);

  if (selected.includes('create-id')) await recordCreateId(page, mobile, password, username);
  if (selected.includes('bank-details')) await recordBank(page);
  if (selected.includes('manage-id')) await recordManage(page, mobile, password);
  if (selected.includes('change-password')) await recordPassword(page, password);
  if (selected.includes('passbook')) await recordPassbook(page);
  if (selected.includes('notifications')) await recordNotifications(page);

  console.log(`ALL_DONE ${OUT_DIR}`);
});

async function recordCreateId(page, mobile, password, username) {
  const frames = await prepareWork('01-create-id');
  const n = N.create;

  await page.goto('https://kapunter.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(700);
  await teachCard(page, {
    step: '1 / 8',
    title: 'Create a gaming ID',
    subtitle: 'Follow the orange arrows. Admin creates the final account after you submit.',
    actions: [
      { icon: '1️⃣', title: 'Login', desc: 'Mobile + password' },
      { icon: '2️⃣', title: 'Create ID', desc: 'Pick site + username' },
      { icon: '3️⃣', title: 'Submit', desc: 'Admin approves' },
    ],
    activeIndex: 0,
  });
  await snap(page, frames, 'intro', n[0], 'Step 1 — Create ID overview');

  await clearGuideUi(page);
  const loginBtn = page.getByRole('button', { name: /login.*signup/i }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await pointAt(page, loginBtn, 'Tap Login | Signup');
    await snap(page, frames, 'login-btn', n[1], 'Step 2 — Open login');
    await clearGuideUi(page);
    await loginBtn.click();
    await page.getByPlaceholder('10-digit mobile number').fill(mobile);
    await pointAt(page, page.getByPlaceholder('10-digit mobile number'), 'Enter mobile (masked)');
    await snap(page, frames, 'mobile', n[1], 'Step 2 — Mobile number');
    await clearGuideUi(page);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Password', exact: true }).click();
    await page.getByPlaceholder('Enter password').fill(password);
    await pointAt(page, page.getByRole('button', { name: 'Log In', exact: true }), 'Password stays hidden → Log In');
    await snap(page, frames, 'password', n[2], 'Step 3 — Password login');
    await clearGuideUi(page);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    await page.getByPlaceholder('Enter password').waitFor({ state: 'detached', timeout: 45_000 });
  } else {
    await snap(page, frames, 'already-in', n[2], 'Step 3 — Already signed in');
  }

  await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=create', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.locator('.loading-container').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(800);
  await pointAt(page, page.getByRole('button', { name: /create id/i }).first(), 'You are on Create ID');
  await snap(page, frames, 'create-tab', n[3], 'Step 4 — Create ID tab');

  const createBtn = page.locator('button.site-action-create').first();
  if (await createBtn.isVisible().catch(() => false)) {
    await clearGuideUi(page);
    await pointAt(page, createBtn, 'Tap Create ID on a site');
    await snap(page, frames, 'site-create', n[4], 'Step 5 — Choose site & Create ID');
    await clearGuideUi(page);
    await createBtn.click();
    await page.waitForTimeout(500);
    const modal = page.locator('.create-id-modal');
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await page.locator('#createIdUsername').fill(username);
    await pointAt(page, page.locator('#createIdUsername'), 'Type preferred username');
    await snap(page, frames, 'username', n[5], 'Step 6 — Enter username');
    await clearGuideUi(page);
    const submitBtn = modal.getByRole('button', { name: 'Create ID', exact: true });
    await pointAt(page, submitBtn, 'Tap Create ID to submit');
    await snap(page, frames, 'submit', n[6], 'Step 7 — Submit request');
    await clearGuideUi(page);
    await submitBtn.click();
    await Promise.race([
      modal.waitFor({ state: 'hidden', timeout: 25_000 }),
      page.getByText(/submitted|unable|already/i).waitFor({ timeout: 25_000 }),
    ]).catch(() => {});
    await page.waitForTimeout(1000);
  } else {
    await teachCard(page, {
      step: '5 / 8',
      title: 'No free site right now',
      subtitle: 'Every site already has an active or pending ID. Close an ID later to create again.',
      actions: [{ icon: '✅', title: 'Request already in progress', desc: 'Watch Track / Notifications for approval' }],
      activeIndex: 0,
    });
    await snap(page, frames, 'no-site', n[4], 'Step 5 — Waiting for a free site');
    await snap(page, frames, 'no-site-2', n[5], 'Step 6 — Username comes after Create ID');
    await snap(page, frames, 'no-site-3', n[6], 'Step 7 — Submit for admin approval');
  }

  await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=active', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(900);
  await pointAt(page, page.getByRole('button', { name: /^Active/i }).first(), 'Approved IDs appear under Active');
  await snap(page, frames, 'active', n[7], 'Step 8 — My IDs after approval');
  await clearGuideUi(page);
  await finishModule(frames, '01-create-id');
}

async function recordBank(page) {
  const frames = await prepareWork('02-bank-details');
  const n = N.bank;

  await page.goto('https://kapunter.com/bankAccount/list-user-bank-account', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(1000);
  await teachCard(page, {
    step: '1 / 5',
    title: 'Add bank details',
    subtitle: 'Save bank or UPI once for fast withdrawals.',
    actions: [
      { icon: '🏦', title: 'Bank account', desc: 'Name, number, IFSC' },
      { icon: '📱', title: 'UPI', desc: 'Optional faster payout' },
    ],
    activeIndex: 0,
  });
  await snap(page, frames, 'intro', n[0], 'Step 1 — Withdraw details');

  await clearGuideUi(page);
  const bankTab = page.getByRole('button', { name: /^Bank$/i }).first();
  if (await bankTab.isVisible().catch(() => false)) {
    await pointAt(page, bankTab, 'Bank tab');
    await snap(page, frames, 'bank-tab', n[1], 'Step 2 — Bank tab');
  }

  await clearGuideUi(page);
  const addBank = page.getByRole('button', { name: /add bank/i }).first();
  if (await addBank.isVisible().catch(() => false)) {
    await pointAt(page, addBank, 'Tap Add bank');
    await snap(page, frames, 'add-btn', n[1], 'Step 2 — Add bank button');
    await clearGuideUi(page);
    await addBank.click();
    await page.waitForTimeout(600);
    const bankName = page.locator('input[formcontrolname="BName"]');
    if (await bankName.isVisible().catch(() => false)) {
      await bankName.fill('Demo Bank');
      await page.locator('input[formcontrolname="AHName"]').fill('Account Holder');
      await page.locator('input[formcontrolname="ANumber"]').fill('123456789012');
      await page.locator('input[formcontrolname="IFSCCode"]').fill('DEMO0001234');
      await pointAt(page, page.locator('input[formcontrolname="ANumber"]'), 'Account number (masked in guide)');
      await snap(page, frames, 'filled', n[2], 'Step 3 — Fill bank form');
      await clearGuideUi(page);
      const saveBtn = page.getByRole('button', { name: /add bank account/i }).first();
      await pointAt(page, saveBtn, 'Tap Add Bank Account to save');
      await snap(page, frames, 'save', n[4], 'Step 5 — Save for withdrawals');
      await closeModal(page);
    }
  }

  const upiTab = page.getByRole('button', { name: /^UPI$/i }).first();
  if (await upiTab.isVisible().catch(() => false)) {
    await clearGuideUi(page);
    await pointAt(page, upiTab, 'Or open UPI tab');
    await snap(page, frames, 'upi', n[3], 'Step 4 — UPI option');
    await clearGuideUi(page);
    await upiTab.click();
    await page.waitForTimeout(500);
    const addUpi = page.getByRole('button', { name: /add upi/i }).first();
    if (await addUpi.isVisible().catch(() => false)) {
      await pointAt(page, addUpi, 'Tap Add UPI');
      await snap(page, frames, 'upi-add', n[3], 'Step 4 — Add UPI');
    }
  }

  await clearGuideUi(page);
  await teachCard(page, {
    step: '5 / 5',
    title: 'Saved payment methods',
    subtitle: 'Kapunter uses these details whenever you withdraw.',
    actions: [{ icon: '✅', title: 'Ready for payouts', desc: 'Bank / UPI / QR' }],
    activeIndex: 0,
  });
  await snap(page, frames, 'done', n[4], 'Done — Withdraw details ready');
  await clearGuideUi(page);
  await finishModule(frames, '02-bank-details');
}

async function recordManage(page, mobile, password) {
  const frames = await prepareWork('03-manage-id');
  const n = N.manage;

  const loginVisible = await page.getByRole('button', { name: /login.*signup/i }).first().isVisible().catch(() => false);
  if (loginVisible) {
    await loginQuiet(page, mobile, password);
  }

  await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=active', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(1500);

  if (/kapunter\.com\/?$/.test(page.url()) || await page.getByRole('button', { name: /login.*signup/i }).first().isVisible().catch(() => false)) {
    await loginQuiet(page, mobile, password);
    await page.goto('https://kapunter.com/site/app-get-user-list-site-by-id?view=active', {
      waitUntil: 'domcontentloaded', timeout: 60_000,
    });
    await page.waitForTimeout(1500);
  }

  await page.locator('.loading-container').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await Promise.race([
    page.getByRole('button', { name: /deposit/i }).first().waitFor({ state: 'visible', timeout: 25_000 }),
    page.locator('.ids-hub-empty').waitFor({ state: 'visible', timeout: 25_000 }),
  ]).catch(() => {});
  await page.waitForTimeout(1000);

  const getCard = () =>
    page.locator('article.site-card').filter({ has: page.getByRole('button', { name: /deposit/i }) }).first();

  let card = getCard();
  let hasActive = await card.isVisible().catch(() => false);
  if (!hasActive) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    card = getCard();
    hasActive = await card.isVisible().catch(() => false);
  }
  if (!hasActive) {
    throw new Error('No active ID found for Manage ID demo.');
  }

  const siteName = ((await card.locator('.site-name').textContent()) || 'your site').trim();

  // 1 Overview
  await page.waitForTimeout(800);
  await snap(page, frames, 'intro', n[0], 'My IDs — after approval');

  // 2 Select ID
  await clearGuideUi(page);
  await pointAt(page, getCard().locator('.site-name'), `Select ${siteName}`);
  await page.waitForTimeout(700);
  await snap(page, frames, 'select-id', n[1], `Select your ID — ${siteName}`);

  // 3 Actions grid
  await clearGuideUi(page);
  await pointAt(page, getCard().locator('.site-actions-grid'), 'All actions are here');
  await page.waitForTimeout(700);
  await snap(page, frames, 'actions-grid', n[2], 'Actions on this ID');

  // ========== FULL DEPOSIT FLOW ==========
  await clearGuideUi(page);
  await pointAt(page, getCard().getByRole('button', { name: /deposit/i }), 'Tap Deposit');
  await page.waitForTimeout(600);
  await snap(page, frames, 'deposit-tap', {
    en: 'Let us start with Deposit. Tap the Deposit button on your ID card.',
    hi: 'पहले डिपॉज़िट देखते हैं। अपनी आईडी कार्ड पर डिपॉज़िट बटन टैप करें।',
    kn: 'ಮೊದಲು ಡಿಪಾಸಿಟ್ ನೋಡೋಣ. ನಿಮ್ಮ ಐಡಿ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಡಿಪಾಸಿಟ್ ಬಟನ್ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  }, 'Tap Deposit');

  await clearGuideUi(page);
  await getCard().getByRole('button', { name: /deposit/i }).click();
  await page.waitForTimeout(1400);

  // Amount screen
  const coinsInput = page.locator('input[formcontrolname="coins"]').first();
  await expect(coinsInput).toBeVisible({ timeout: 15_000 });
  await pointAt(page, coinsInput, 'Enter deposit amount');
  await page.waitForTimeout(600);
  await snap(page, frames, 'deposit-amount-empty', {
    en: 'Now enter how many coins you want to deposit. Use at least the minimum amount shown below the field.',
    hi: 'अब जितने कॉइन डिपॉज़िट करने हैं उतना अमाउंट लिखें। फ़ील्ड के नीचे लिखा मिनिमम अमाउंट ध्यान में रखें।',
    kn: 'ಈಗ ಎಷ್ಟು ನಾಣ್ಯಗಳನ್ನು ಡಿಪಾಸಿಟ್ ಮಾಡಬೇಕು ಎಂದು ನಮೂದಿಸಿ. ಕ್ಷೇತ್ರದ ಕೆಳಗೆ ತೋರಿಸಿರುವ ಕನಿಷ್ಠ ಮೊತ್ತವನ್ನು ಗಮನಿಸಿ.',
  }, 'Enter deposit amount');

  await clearGuideUi(page);
  // App minimum is 500 — use a clear demo amount
  await coinsInput.fill('1000');
  await coinsInput.blur().catch(() => {});
  await page.waitForTimeout(800);
  const depositContinue = page.getByRole('button', { name: /deposit coins/i }).first();
  await pointAt(page, depositContinue, 'Tap Deposit Coins');
  await page.waitForTimeout(600);
  await snap(page, frames, 'deposit-amount-filled', {
    en: 'Amount is entered. Next, tap Deposit Coins to continue to payment.',
    hi: 'अमाउंट भर दिया है। आगे बढ़ने के लिए डिपॉज़िट कॉइन्स टैप करें।',
    kn: 'ಮೊತ್ತ ನಮೂದಿಸಲಾಗಿದೆ. ಮುಂದುವರಿಯಲು ಡಿಪಾಸಿಟ್ ಕಾಯಿನ್ಸ್ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  }, 'Tap Deposit Coins to continue');

  await clearGuideUi(page);
  await depositContinue.click();
  await page.waitForTimeout(1800);

  // Payment mode chooser
  const bankMode = page.locator('button.deposit-pay-mode[title="Bank"], button.deposit-pay-mode').nth(1);
  const payModes = page.locator('.deposit-pay-modes, button.deposit-pay-mode').first();
  if (await payModes.isVisible().catch(() => false)) {
    await pointAt(page, page.locator('.deposit-pay-modes').first(), 'Choose QR, Bank or UPI');
    await page.waitForTimeout(700);
    await snap(page, frames, 'deposit-pay-modes', {
      en: 'Choose how you want to pay — QR code, bank transfer, or UPI. We will open Bank transfer.',
      hi: 'पेमेंट कैसे करना है चुनें — क्यूआर, बैंक ट्रांसफर या यूपीआई। हम बैंक ट्रांसफर खोलते हैं।',
      kn: 'ಹೇಗೆ ಪಾವತಿ ಮಾಡಬೇಕು ಆಯ್ಕೆಮಾಡಿ — QR, ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ ಅಥವಾ UPI. ನಾವು ಬ್ಯಾಂಕ್ ತೆರೆಯುತ್ತೇವೆ.',
    }, 'Choose payment method');

    await clearGuideUi(page);
    const bankBtn = page.locator('button.deposit-pay-mode[title="Bank"]').first();
    if (await bankBtn.isVisible().catch(() => false)) {
      await pointAt(page, bankBtn, 'Tap Bank');
      await page.waitForTimeout(500);
      await snap(page, frames, 'deposit-bank-tap', {
        en: 'Tap Bank. Kapunter will show the account details for you automatically.',
        hi: 'बैंक टैप करें। कपंटर खुद अकाउंट डिटेल्स दिखा देगा।',
        kn: 'ಬ್ಯಾಂಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ. ಕಪುಂಟರ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಖಾತೆ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.',
      }, 'Tap Bank');
      await clearGuideUi(page);
      await bankBtn.click();
    } else if (await bankMode.isVisible().catch(() => false)) {
      await bankMode.click();
    }
    await page.waitForTimeout(1200);
    await page.locator('.payment-detail-loading').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Auto account details
    const accountRow = page.locator('.payment-detail-row, .payment-detail-value').first();
    await accountRow.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1000);
    if (await page.locator('.payment-detail-row').first().isVisible().catch(() => false)) {
      await pointAt(page, page.locator('.payment-detail-row').first(), 'Account appears automatically');
      await page.waitForTimeout(600);
    }
    await snap(page, frames, 'deposit-auto-account', {
      en: 'See — the deposit account comes automatically as per Kapunter standard. You do not need to search for an account. Just pay to these details, then upload your payment proof and submit.',
      hi: 'देखिए — डिपॉज़िट अकाउंट कपंटर स्टैंडर्ड के अनुसार अपने आप आ जाता है। अलग से अकाउंट ढूंढने की ज़रूरत नहीं। इन डिटेल्स पर पेमेंट करें, प्रूफ अपलोड करें और सबमिट करें।',
      kn: 'ನೋಡಿ — ಡಿಪಾಸಿಟ್ ಖಾತೆ ಕಪುಂಟರ್ ಮಾನದಂಡದಂತೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬರುತ್ತದೆ. ಪ್ರತ್ಯೇಕವಾಗಿ ಖಾತೆ ಹುಡುಕಬೇಕಿಲ್ಲ. ಈ ವಿವರಗಳಿಗೆ ಪಾವತಿ ಮಾಡಿ, ಪ್ರೂಫ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಸಲ್ಲಿಸಿ.',
    }, 'Account details load automatically');

    await clearGuideUi(page);
    const proof = page.locator('.kp-file-upload, label.kp-file-upload').first();
    if (await proof.isVisible().catch(() => false)) {
      await pointAt(page, proof, 'Upload payment proof');
      await page.waitForTimeout(500);
      await snap(page, frames, 'deposit-proof', {
        en: 'After you pay, upload the payment screenshot here, then tap Submit. In this guide we will not submit a real payment.',
        hi: 'पेमेंट के बाद स्क्रीनशॉट यहाँ अपलोड करें, फिर सबमिट करें। इस गाइड में असली पेमेंट सबमिट नहीं करेंगे।',
        kn: 'ಪಾವತಿಯ ನಂತರ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಇಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ನಂತರ ಸಲ್ಲಿಸಿ. ಈ ಮಾರ್ಗದರ್ಶಿಯಲ್ಲಿ ನಿಜವಾದ ಪಾವತಿ ಸಲ್ಲಿಸುವುದಿಲ್ಲ.',
      }, 'Upload proof, then Submit');
    }
  } else {
    await snap(page, frames, 'deposit-next', {
      en: 'After entering the amount, continue. Payment options and account details will appear next.',
      hi: 'अमाउंट डालने के बाद आगे बढ़ें। अगले स्टेप में पेमेंट ऑप्शन और अकाउंट डिटेल्स आएंगे।',
      kn: 'ಮೊತ್ತ ನಮೂದಿಸಿದ ನಂತರ ಮುಂದುವರಿಯಿರಿ. ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಪಾವತಿ ಆಯ್ಕೆಗಳು ಮತ್ತು ಖಾತೆ ವಿವರಗಳು ಬರುತ್ತವೆ.',
    }, 'Continue deposit');
  }

  await closeModal(page);
  await page.waitForTimeout(900);

  // TRANSFER
  await pointAt(page, getCard().getByRole('button', { name: /transfer/i }), 'Tap Transfer');
  await page.waitForTimeout(500);
  await snap(page, frames, 'transfer-tap', {
    en: 'Next is Transfer. Use this when you want to move coins from your Kapunter wallet to this gaming ID.',
    hi: 'अगला है ट्रांसफर। जब वॉलेट से इस गेमिंग आईडी में कॉइन भेजना हो, तब इसे इस्तेमाल करें।',
    kn: 'ಮುಂದೆ ಟ್ರಾನ್ಸ್‌ಫರ್. ಕಪುಂಟರ್ ವಾಲೆಟ್‌ನಿಂದ ಈ ಗೇಮಿಂಗ್ ಐಡಿಗೆ ನಾಣ್ಯಗಳನ್ನು ಸರಿಸಲು ಇದನ್ನು ಬಳಸಿ.',
  }, 'Tap Transfer');
  await clearGuideUi(page);
  await getCard().getByRole('button', { name: /transfer/i }).click();
  await page.waitForTimeout(1400);
  await snap(page, frames, 'transfer-screen', {
    en: 'Enter the coins to transfer, review carefully, then confirm. We close this without submitting.',
    hi: 'ट्रांसफर करने वाले कॉइन लिखें, ध्यान से देखें, फिर कन्फर्म करें। हम बिना सबमिट किए बंद करते हैं।',
    kn: 'ವರ್ಗಾಯಿಸುವ ನಾಣ್ಯಗಳನ್ನು ನಮೂದಿಸಿ, ಎಚ್ಚರಿಕೆಯಿಂದ ನೋಡಿ, ನಂತರ ದೃಢೀಕರಿಸಿ. ನಾವು ಸಲ್ಲಿಸದೆ ಮುಚ್ಚುತ್ತೇವೆ.',
  }, 'Transfer screen');
  await closeModal(page);
  await page.waitForTimeout(800);

  // WITHDRAW
  await pointAt(page, getCard().getByRole('button', { name: /withdraw/i }), 'Tap Withdraw');
  await page.waitForTimeout(500);
  await snap(page, frames, 'withdraw-tap', {
    en: 'Withdraw is for taking coins out. Tap Withdraw on the same ID card.',
    hi: 'विड्रॉ से कॉइन बाहर निकालते हैं। उसी आईडी कार्ड पर विड्रॉ टैप करें।',
    kn: 'ವಿತ್‌ಡ್ರಾ ನಾಣ್ಯಗಳನ್ನು ಹೊರತೆಗೆಯಲು. ಅದೇ ಐಡಿ ಕಾರ್ಡ್‌ನಲ್ಲಿ ವಿತ್‌ಡ್ರಾ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  }, 'Tap Withdraw');
  await clearGuideUi(page);
  await getCard().getByRole('button', { name: /withdraw/i }).click();
  await page.waitForTimeout(1400);
  await snap(page, frames, 'withdraw-screen', {
    en: 'Enter the withdraw amount. Your preferred bank account is selected automatically when available. Confirm only when you are ready.',
    hi: 'विड्रॉ अमाउंट लिखें। पसंदीदा बैंक अकाउंट उपलब्ध होने पर अपने आप सिलेक्ट हो जाता है। तैयार होने पर ही कन्फर्म करें।',
    kn: 'ವಿತ್‌ಡ್ರಾ ಮೊತ್ತ ನಮೂದಿಸಿ. ನಿಮ್ಮ ಆದ್ಯತೆಯ ಬ್ಯಾಂಕ್ ಖಾತೆ ಲಭ್ಯವಿದ್ದರೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆಯ್ಕೆಯಾಗುತ್ತದೆ. ಸಿದ್ಧರಾದಾಗ ಮಾತ್ರ ದೃಢೀಕರಿಸಿ.',
  }, 'Withdraw — bank selected automatically');
  await closeModal(page);
  await page.waitForTimeout(800);

  // DETAILS
  await pointAt(page, getCard().getByRole('button', { name: /my id details|details/i }), 'Tap My ID details');
  await page.waitForTimeout(500);
  await snap(page, frames, 'details-tap', {
    en: 'Open My ID details anytime to view this account information.',
    hi: 'इस अकाउंट की जानकारी देखने के लिए कभी भी माई आईडी डिटेल्स खोलें।',
    kn: 'ಈ ಖಾತೆಯ ಮಾಹಿತಿ ನೋಡಲು ಯಾವಾಗಲಾದರೂ ಮೈ ಐಡಿ ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ.',
  }, 'Tap My ID details');
  await clearGuideUi(page);
  await getCard().getByRole('button', { name: /my id details|details/i }).click();
  await page.waitForTimeout(1400);
  await snap(page, frames, 'details-screen', {
    en: 'Here you can check the ID details for this site. Close when you are done.',
    hi: 'यहाँ इस साइट की आईडी डिटेल्स चेक कर सकते हैं। देखने के बाद बंद करें।',
    kn: 'ಇಲ್ಲಿ ಈ ಸೈಟ್‌ನ ಐಡಿ ವಿವರಗಳನ್ನು ನೋಡಬಹುದು. ನೋಡಿದ ನಂತರ ಮುಚ್ಚಿ.',
  }, 'ID details');
  await closeModal(page);
  await page.waitForTimeout(800);

  // HISTORY
  await pointAt(page, getCard().getByRole('button', { name: /transaction history|history/i }), 'Tap Transaction History');
  await page.waitForTimeout(500);
  await snap(page, frames, 'history-tap', {
    en: 'Transaction History shows every deposit, transfer and withdraw for this ID.',
    hi: 'ट्रांज़ैक्शन हिस्ट्री में इस आईडी की हर डिपॉज़िट, ट्रांसफर और विड्रॉ दिखती है।',
    kn: 'ಟ್ರಾನ್ಸಾಕ್ಷನ್ ಇತಿಹಾಸದಲ್ಲಿ ಈ ಐಡಿಯ ಪ್ರತಿ ಡಿಪಾಸಿಟ್, ಟ್ರಾನ್ಸ್‌ಫರ್ ಮತ್ತು ವಿತ್‌ಡ್ರಾ ಕಾಣುತ್ತದೆ.',
  }, 'Tap Transaction History');
  await clearGuideUi(page);
  await getCard().getByRole('button', { name: /transaction history|history/i }).click();
  await page.waitForTimeout(1400);
  await snap(page, frames, 'history-screen', {
    en: 'Review the full history, then go back to your ID card.',
    hi: 'पूरा हिस्ट्री देखें, फिर अपनी आईडी कार्ड पर वापस आएं।',
    kn: 'ಪೂರ್ಣ ಇತಿಹಾಸ ನೋಡಿ, ನಂತರ ನಿಮ್ಮ ಐಡಿ ಕಾರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ.',
  }, 'Transaction History');
  await closeModal(page);
  await page.waitForTimeout(800);

  // REMOVE
  const removeBtn = getCard().getByRole('button', { name: /remove id/i });
  if (await removeBtn.isVisible().catch(() => false)) {
    await pointAt(page, removeBtn, 'Tap Remove ID');
    await page.waitForTimeout(500);
    await snap(page, frames, 'remove-tap', {
      en: 'Remove ID is only when you want to close this account. Tap it to open the request.',
      hi: 'रिमूव आईडी तभी जब अकाउंट बंद करना हो। रिक्वेस्ट खोलने के लिए टैप करें।',
      kn: 'ರಿಮೂವ್ ಐಡಿ ಖಾತೆ ಮುಚ್ಚಬೇಕಾದಾಗ ಮಾತ್ರ. ವಿನಂತಿ ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ.',
    }, 'Tap Remove ID');
    await clearGuideUi(page);
    await removeBtn.click();
    await page.waitForTimeout(1400);
    await snap(page, frames, 'remove-screen', {
      en: 'This sends a close request to admin. In this guide we cancel — confirm only if you really want to close the ID.',
      hi: 'यह एडमिन को बंद करने का अनुरोध भेजता है। इस गाइड में हम रद्द करते हैं — सच में बंद करना हो तभी कन्फर्म करें।',
      kn: 'ಇದು ಅಡ್ಮಿನ್‌ಗೆ ಮುಚ್ಚುವ ವಿನಂತಿ ಕಳುಹಿಸುತ್ತದೆ. ಈ ಮಾರ್ಗದರ್ಶಿಯಲ್ಲಿ ರದ್ದು ಮಾಡುತ್ತೇವೆ — ನಿಜವಾಗಿ ಮುಚ್ಚಬೇಕಾದರೆ ಮಾತ್ರ ದೃಢೀಕರಿಸಿ.',
    }, 'Remove ID request — cancel in demo');
    await closeModal(page);
  }

  await clearGuideUi(page);
  await page.waitForTimeout(600);
  await snap(page, frames, 'done', {
    en: 'That completes the full walkthrough. Select your ID, deposit with automatic account details, then transfer, withdraw, view details, check history, or remove when needed.',
    hi: 'पूरा वॉकथ्रू पूरा हुआ। आईडी चुनें, ऑटो अकाउंट डिटेल्स के साथ डिपॉज़िट करें, फिर ट्रांसफर, विड्रॉ, डिटेल्स, हिस्ट्री या ज़रूरत पर रिमूव करें।',
    kn: 'ಪೂರ್ಣ ವಾಕ್‌ತ್ರೂ ಮುಗಿಯಿತು. ಐಡಿ ಆಯ್ಕೆಮಾಡಿ, ಸ್ವಯಂ ಖಾತೆ ವಿವರಗಳೊಂದಿಗೆ ಡಿಪಾಸಿಟ್ ಮಾಡಿ, ನಂತರ ಟ್ರಾನ್ಸ್‌ಫರ್, ವಿತ್‌ಡ್ರಾ, ವಿವರಗಳು, ಇತಿಹಾಸ ಅಥವಾ ಅಗತ್ಯವಿದ್ದಾಗ ರಿಮೂವ್ ಮಾಡಿ.',
  }, 'Done — full Manage ID demo');

  await clearGuideUi(page);
  await finishModule(frames, '03-manage-id');
}

async function recordPassword(page, password) {
  const frames = await prepareWork('04-change-password');
  const n = N.password;

  await page.goto('https://kapunter.com/account/profile-details', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(1000);
  await teachCard(page, {
    step: '1 / 4',
    title: 'Change password',
    subtitle: 'Open Profile, then Change Password.',
    actions: [{ icon: '🔐', title: 'My Account → Profile', desc: 'Security settings' }],
    activeIndex: 0,
  });
  await snap(page, frames, 'intro', n[0], 'Step 1 — Profile');

  await clearGuideUi(page);
  const changeBtn = page.getByRole('button', { name: /change password|set password/i }).first();
  await expect(changeBtn).toBeVisible({ timeout: 15_000 });
  await pointAt(page, changeBtn, 'Tap Change Password');
  await snap(page, frames, 'btn', n[1], 'Step 2 — Change Password button');
  await clearGuideUi(page);
  await changeBtn.click();
  await page.waitForTimeout(600);

  const modal = page.locator('.change-password-modal');
  await expect(modal).toBeVisible({ timeout: 15_000 });
  const current = modal.locator('input[formcontrolname="currentPassword"]');
  if (await current.isVisible().catch(() => false)) await current.fill(password);
  await modal.locator('input[formcontrolname="changePassword"]').fill('DemoPass1');
  await modal.locator('input[formcontrolname="confirmPassword"]').fill('DemoPass1');
  await pointAt(page, modal.locator('input[formcontrolname="changePassword"]'), 'New password (hidden)');
  await snap(page, frames, 'filled', n[2], 'Step 3 — Enter passwords');
  await clearGuideUi(page);
  const saveBtn = modal.locator('.change-password-submit');
  await pointAt(page, saveBtn, 'Tap save when ready (we cancel in this guide)');
  await snap(page, frames, 'save', n[3], 'Step 4 — Save new password');
  await closeModal(page);
  await finishModule(frames, '04-change-password');
}

async function recordPassbook(page) {
  const frames = await prepareWork('05-passbook');
  const n = N.passbook;

  await page.goto('https://kapunter.com/passbook/passbook-view-panel', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(1200);
  await teachCard(page, {
    step: '1 / 4',
    title: 'Passbook & live trace',
    subtitle: 'Every deposit, withdraw and ID movement in one place.',
    actions: [
      { icon: '📒', title: 'Passbook ledger', desc: 'Credits & debits' },
      { icon: '📡', title: 'Track', desc: 'Live request status' },
    ],
    activeIndex: 0,
  });
  await snap(page, frames, 'intro', n[0], 'Step 1 — Passbook');

  await clearGuideUi(page);
  await pointAt(page, page.locator('.passbook-hero, .passbook-shell header, h1').first(), 'Passbook home');
  await snap(page, frames, 'home', n[1], 'Step 2 — Ledger');

  const track = page.locator('.passbook-track-btn').first();
  if (await track.isVisible().catch(() => false)) {
    await clearGuideUi(page);
    await pointAt(page, track, 'Tap Track for live status');
    await snap(page, frames, 'track-btn', n[2], 'Step 3 — Live Track');
    await clearGuideUi(page);
    await track.click();
    await page.waitForTimeout(800);
    await snap(page, frames, 'track-panel', n[2], 'Step 3 — Live request trace');
    await closeModal(page);
  } else {
    await teachCard(page, {
      step: '3 / 4',
      title: 'Live Trace',
      subtitle: 'Track follows open requests: Submitted → Reviewing → Completed.',
      actions: [
        { icon: '1', title: 'Submitted', desc: 'You sent the request' },
        { icon: '2', title: 'Admin reviewing', desc: 'In progress' },
        { icon: '3', title: 'Completed', desc: 'Done / paid' },
      ],
      activeIndex: 1,
    });
    await snap(page, frames, 'track-teach', n[2], 'Step 3 — Live Trace');
  }

  await clearGuideUi(page);
  await teachCard(page, {
    step: '4 / 4',
    title: 'Stay transparent',
    subtitle: 'Check Passbook anytime for full wallet clarity.',
    actions: [{ icon: '✅', title: 'Passbook complete', desc: 'Ledger + live trace' }],
    activeIndex: 0,
  });
  await snap(page, frames, 'done', n[3], 'Done — Passbook');
  await clearGuideUi(page);
  await finishModule(frames, '05-passbook');
}

async function recordNotifications(page) {
  const frames = await prepareWork('06-notifications');
  const n = N.notify;

  await page.goto('https://kapunter.com/notification/list-notification', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(1200);
  await teachCard(page, {
    step: '1 / 3',
    title: 'Notifications',
    subtitle: 'ID approvals, payouts, passbook activity and announcements.',
    actions: [{ icon: '🔔', title: 'Open Notifications', desc: 'From More menu or bell icon' }],
    activeIndex: 0,
  });
  await snap(page, frames, 'intro', n[0], 'Step 1 — Notifications');

  await clearGuideUi(page);
  const item = page.locator('.notification-item').first();
  if (await item.isVisible().catch(() => false)) {
    await pointAt(page, item, 'Tap a notification');
    await snap(page, frames, 'list', n[1], 'Step 2 — Alerts list');
    await clearGuideUi(page);
    await item.click();
    await page.waitForTimeout(900);
    await snap(page, frames, 'opened', n[1], 'Step 2 — Open related screen');
  } else {
    await pointAt(page, page.locator('.notification-header, h1').first(), 'Notifications inbox');
    await snap(page, frames, 'empty', n[1], 'Step 2 — Inbox');
  }

  await page.goto('https://kapunter.com/notification/list-notification', {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  await page.waitForTimeout(700);
  await teachCard(page, {
    step: '3 / 3',
    title: 'Never miss an update',
    subtitle: 'Keep notifications on for approvals and payouts.',
    actions: [{ icon: '✅', title: 'All set', desc: 'EN · HI · KN guides available' }],
    activeIndex: 0,
  });
  await snap(page, frames, 'done', n[2], 'Done — Notifications');
  await clearGuideUi(page);
  await finishModule(frames, '06-notifications');
}
