import wardrobeBalanceData from '../data/wardrobeBalance.json';

type WardrobeBalance = {
  balance: number;
};

const data = wardrobeBalanceData as WardrobeBalance;

export const WARDROBE_BALANCE = Number.isFinite(data.balance) ? data.balance : 0;
