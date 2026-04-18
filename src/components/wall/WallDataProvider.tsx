'use client';

import React, { useMemo, useState, useCallback, useSyncExternalStore } from 'react';
import { MESSAGES } from '../../constants/messages';
import type { Message } from '@/types';
import { LOCATIONS } from '../../constants/locations';
import { isCollectibleUnlocked } from '../../lib/storage';
import type { DanmakuItem } from './Danmaku';

export interface WallDataChildrenArgs {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  clearQuery: () => void;
  selectedLocationFilter: string | null;
  setSelectedLocationFilter: React.Dispatch<React.SetStateAction<string | null>>;
  unlockedLocations: (typeof LOCATIONS)[number][];
  filteredMessages: Message[];
  locationFilteredMessages: Message[];
  selectedMessage: Message | null;
  setSelectedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  selectedDanmakuItem: DanmakuItem | null;
}

interface WallDataProviderProps {
  children: (args: WallDataChildrenArgs) => React.ReactNode;
}

export const WallDataProvider: React.FC<WallDataProviderProps> = ({ children }) => {
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('location');
  });
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [query, setQuery] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('q') ?? '';
  });

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const unlockedLocations = useMemo(() => {
    return LOCATIONS.filter((loc) => isCollectibleUnlocked(loc.id));
  }, []);

  const locationNameById = useMemo(() => {
    return new Map(LOCATIONS.map((loc) => [loc.id, loc.name]));
  }, []);

  const queryText = useMemo(() => query.trim().toLocaleLowerCase(), [query]);

  const locationFilteredMessages = useMemo(() => {
    if (!selectedLocationFilter) return MESSAGES;
    return MESSAGES.filter((msg) => msg.locationId === selectedLocationFilter);
  }, [selectedLocationFilter]);

  const filteredMessages = useMemo(() => {
    if (queryText.length === 0) return locationFilteredMessages;

    return locationFilteredMessages.filter((msg) => {
      const locationName = locationNameById.get(msg.locationId) ?? '';
      const content = msg.content.toLocaleLowerCase();
      const authorName = msg.author.username.toLocaleLowerCase();
      const location = locationName.toLocaleLowerCase();

      return (
        content.includes(queryText) ||
        authorName.includes(queryText) ||
        location.includes(queryText)
      );
    });
  }, [locationFilteredMessages, locationNameById, queryText]);

  const selectedDanmakuItem = useMemo(() => {
    if (!selectedMessage) return null;

    return {
      id: selectedMessage.id,
      text: selectedMessage.content,
      avatar: selectedMessage.author.avatarUrl,
      rightImage: selectedMessage.imageUrl,
      top: 0,
      duration: 0,
      originalMessage: selectedMessage,
    };
  }, [selectedMessage]);

  const clearQuery = useCallback(() => setQuery(''), []);

  return (
    <>
      {children({
        query: isHydrated ? query : '',
        setQuery,
        clearQuery,
        selectedLocationFilter: isHydrated ? selectedLocationFilter : null,
        setSelectedLocationFilter,
        unlockedLocations: isHydrated ? unlockedLocations : [],
        filteredMessages: isHydrated ? filteredMessages : MESSAGES,
        locationFilteredMessages: isHydrated ? locationFilteredMessages : MESSAGES,
        selectedMessage: isHydrated ? selectedMessage : null,
        setSelectedMessage,
        selectedDanmakuItem: isHydrated ? selectedDanmakuItem : null,
      })}
    </>
  );
};

export default WallDataProvider;
