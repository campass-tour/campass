import type { WardrobeCreditsInfoContent } from '../types';

export const WARDROBE_CREDITS_INFO: WardrobeCreditsInfoContent = {
  helpButtonAriaLabel: 'Open credits guide',
  headerIcon: 'coin',
  title: 'XJTLU Credits',
  closeButtonAriaLabel: 'Close credits guide',
  howToEarnTitle: 'How to Earn',
  transactionHistoryTitle: 'Transaction History',
  emptyTransactionHistoryLabel: 'No transactions yet.',
  creditsLabel: 'Credits',
  creditsCompactLabel: 'CR',
  rules: [
    {
      id: 'social-love',
      icon: 'heart',
      title: 'Social Love',
      description: 'For every like received on the Wall.',
      reward: 1,
    },
    {
      id: 'explorer',
      icon: 'mapPin',
      title: 'Explorer',
      description: 'For every new landmark unlocked.',
      reward: 10,
    },
    {
      id: 'first-echo',
      icon: 'messageCircle',
      title: 'First Echo',
      description: 'For your first whisper at a new location.',
      reward: 5,
    },
  ],
  transactionHistory: [],
  primaryAction: {
    icon: 'rocket',
    label: 'Go to Wall and Post',
    ariaLabel: 'Go to wall and create a new post',
    route: '/wall',
  },
};
