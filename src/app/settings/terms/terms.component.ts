import { Component, OnInit } from '@angular/core';

interface TermsSection {
  id: number;
  title: string;
  icon: string;
  content: string[];
}

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  termsSections: TermsSection[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadTerms();
  }

  loadTerms(): void {
    this.termsSections = [
      {
        id: 1,
        title: 'General Terms & Conditions',
        icon: '📋',
        content: [
          'These Terms and Conditions govern your use of the KAPunter platform.',
          'By accessing or using our services, you agree to be bound by these terms.',
          'We reserve the right to modify these terms at any time without prior notice.',
          'Your continued use of the platform constitutes acceptance of the modified terms.'
        ]
      },
      {
        id: 2,
        title: 'User Eligibility',
        icon: '👤',
        content: [
          'You must be at least 18 years of age to use this platform.',
          'You must be a legal resident of jurisdictions where our services are permitted.',
          'You are responsible for providing accurate and complete information during registration.',
          'You must maintain the confidentiality of your account credentials.',
          'You are solely responsible for all activities under your account.'
        ]
      },
      {
        id: 3,
        title: 'Deposit & Withdrawal',
        icon: '💰',
        content: [
          'All deposits are processed through secure payment gateways.',
          'We process withdrawals within 45 minutes during banking hours.',
          'Withdrawal requests are subject to our verification process.',
          'Bank account freezes due to withdrawal transactions are handled with special verification.',
          'Multiple consecutive withdrawals may require additional verification for security.'
        ]
      },
      {
        id: 4,
        title: 'Bonus & Offers',
        icon: '🎁',
        content: [
          'All bonuses are subject to specific terms and conditions.',
          'Bonuses cannot be withdrawn as cash unless stated otherwise.',
          'Players must complete the required wagering requirements to claim bonuses.',
          'Bonuses may expire if not used within the specified timeframe.',
          'We reserve the right to cancel or modify bonus offers at any time.'
        ]
      },
      {
        id: 5,
        title: 'Fast Withdrawal Guarantee',
        icon: '⚡',
        content: [
          'We guarantee processing of withdrawals within 45 minutes during banking hours.',
          'If we fail to meet this deadline, an additional 3% bonus will be credited.',
          'Banking hours are defined as 9 AM to 5 PM IST on business days.',
          'External bank delays are beyond our control and exempt from this guarantee.',
          'This guarantee applies to verified accounts only.'
        ]
      },
      {
        id: 6,
        title: 'Lossback Offer Terms',
        icon: '🔥',
        content: [
          'Lossback bonus is available when total loss reaches ₹1,00,000 or more.',
          'Option 1: Players must deposit double the lossback amount to withdraw it.',
          'Option 2: Players can place bets on minimum 3 sports events.',
          'Successful completion of all 3 events entitles players to full winnings from those events.',
          'Lossback calculation is done on a rolling 30-day basis.'
        ]
      },
      {
        id: 7,
        title: 'Account Security',
        icon: '🔒',
        content: [
          'We use industry-standard encryption to protect your personal information.',
          'Two-factor authentication is recommended for enhanced security.',
          'Report suspicious activities immediately to our support team.',
          'We will never ask for your password or account details via email.',
          'Users are responsible for securing their login credentials.'
        ]
      },
      {
        id: 8,
        title: 'Responsible Gaming',
        icon: '⚠️',
        content: [
          'Gaming should be for entertainment purposes only.',
          'Set limits on your deposits and gaming time.',
          'Never gamble with money you cannot afford to lose.',
          'Seek help if you suspect gambling addiction.',
          'We provide resources and support for responsible gaming.'
        ]
      },
      {
        id: 9,
        title: 'Data Privacy',
        icon: '🔐',
        content: [
          'Your personal information is protected and never shared with third parties without consent.',
          'We comply with all applicable data protection regulations.',
          'You can request access to or deletion of your personal data at any time.',
          'Cookies are used to enhance your browsing experience.',
          'You can manage cookie preferences in your browser settings.'
        ]
      },
      {
        id: 10,
        title: 'Dispute Resolution',
        icon: '⚖️',
        content: [
          'All disputes will be resolved through our internal grievance mechanism.',
          'Customers must submit disputes within 30 days of the incident.',
          'Our support team will investigate and provide resolution within 15 business days.',
          'If unresolved, disputes may be escalated to arbitration.',
          'Users agree to resolve disputes in accordance with applicable laws.'
        ]
      }
    ];
  }
}
