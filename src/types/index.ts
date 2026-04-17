export interface MessageAuthor {
  username: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  authorId?: number;
  content: string;
  locationId: string;
  likes: number;
  imageUrl?: string;
  timestamp: string;
  author: MessageAuthor;
}

export type GpsCoordinate = {
  lat: number;
  lon: number;
};

export interface Location {
  id: string;
  name: string;
  lv?: number;
  x?: number;
  y?: number;
  gps?: GpsCoordinate;
}

export interface LocationLore {
  id: string;
  title: string;
  content: string;
}

export interface UserPosition {
  x?: number;
  y?: number;
  gps?: GpsCoordinate;
  heading?: number;
}

export type WardrobeSlot = 'head' | 'face' | 'gear';
export type WardrobeCategoryId = 'all' | WardrobeSlot;

export interface WardrobeCategory {
  id: WardrobeSlot;
  name: string;
  description?: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeSlot;
  price: number;
  ownedByDefault?: boolean;
  description?: string;
  image?: string | null;
  icon?: string | null;
  model?: string | null;
  wearableOffset?: [number, number, number] | null;
  wearableRotation?: [number, number, number] | null;
  wearableScale?: [number, number, number] | null;
}

export type WardrobeEquippedBySlot = Partial<Record<WardrobeSlot, string>>;

export type WardrobeCreditsInfoContent = {
  helpButtonAriaLabel: string;
  headerIcon: string;
  title: string;
  closeButtonAriaLabel: string;
  howToEarnTitle: string;
  transactionHistoryTitle: string;
  emptyTransactionHistoryLabel: string;
  creditsLabel: string;
  creditsCompactLabel: string;
  rules: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    reward: number;
  }>;
  transactionHistory: Array<unknown>;
  primaryAction: { icon: string; label: string; ariaLabel: string; route: string };
};
