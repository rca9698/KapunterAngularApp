import { Component, OnInit } from '@angular/core';

interface Offer {
  id: number;
  title: string;
  emoji: string;
  headline: string;
  description: string;
  benefits: string[];
  rules?: Array<{ title: string; content: string; highlight?: boolean }>;
  terms?: string;
  cardType: string;
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  offers: Offer[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offers = [
      {
        id: 1,
        title: 'Fast Withdrawal Guarantee',
        emoji: '⚡',
        headline: 'Lightning-fast payouts guaranteed!',
        description: 'If we are unable to process your withdrawal within 45 minutes during banking hours, you will receive an EXTRA 3% bonus compensation from us!',
        benefits: [
          '✅ Quick payouts',
          '✅ Trusted service',
          '✅ Smooth gaming experience'
        ],
        terms: 'T&C Apply',
        cardType: 'primary'
      },
      {
        id: 2,
        title: 'Withdrawal Delay Offer',
        emoji: '💸',
        headline: 'Your time matters to us!',
        description: 'If your withdrawal is delayed beyond 45 minutes during banking hours, enjoy an additional 3% bonus on your withdrawal amount.',
        benefits: [
          '🎮 Play with confidence',
          '⚡ Faster banking support',
          '🏆 Premium player benefits'
        ],
        terms: 'T&C Apply',
        cardType: 'secondary'
      },
      {
        id: 3,
        title: '45-Minute Withdrawal Promise',
        emoji: '🚀',
        headline: 'We aim for lightning-fast withdrawals!',
        description: 'If your payout is not completed within 45 minutes in banking hours, we\'ll reward you with an EXTRA 3% bonus.',
        benefits: [
          '🔥 Secure',
          '🔥 Reliable',
          '🔥 Player First'
        ],
        terms: 'T&C Apply',
        cardType: 'tertiary'
      },
      {
        id: 4,
        title: 'Important Withdrawal Notice',
        emoji: '⚠️',
        headline: 'Frozen account? We\'ve got your back!',
        description: 'If your bank account gets freezed due to withdrawal transactions from our platform, we will provide another withdrawal opportunity after verification.',
        benefits: [
          '📌 You must submit all required details and proof requested by our support team for verification process.'
        ],
        rules: [
          {
            title: 'Support & Assistance',
            content: '✅ Safe Support\n✅ Quick Assistance\n✅ Trusted Service'
          }
        ],
        terms: 'T&C Apply',
        cardType: 'warning'
      },
      {
        id: 5,
        title: '3% Lossback Special Offer',
        emoji: '🔥',
        headline: 'Recover your losses with our exclusive lossback bonus!',
        description: 'If your total loss reaches minimum ₹1,00,000, you are eligible for 3% Lossback Bonus.',
        benefits: [
          '⚡ Fair Play',
          '⚡ Bigger Rewards',
          '⚡ Exclusive Player Benefits'
        ],
        rules: [
          {
            title: 'Option 1',
            content: '✅ To withdraw Lossback amount next time, player must deposit double the Lossback amount.'
          },
          {
            title: 'Option 2',
            content: '✅ Player can continue gameplay by placing bets on minimum 3 sports events.'
          },
          {
            title: 'Winning Reward',
            content: '🏆 If all 3 events are completed successfully, player will receive full winning amount from those events — not only the 3% bonus.',
            highlight: true
          }
        ],
        terms: 'T&C Apply',
        cardType: 'lossback'
      }
    ];
  }
}
