'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
  unlockedLocations: typeof LOCATIONS;
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
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    // Read initial query params on client without requiring Next's useSearchParams()
    const params = new URLSearchParams(window.location.search);
    const loc = params.get('location');
    const q = params.get('q');
    if (loc) setSelectedLocationFilter(loc);
    if (q) setQuery(q);
  }, []);

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
        query,
        setQuery,
        clearQuery,
        selectedLocationFilter,
        setSelectedLocationFilter,
        unlockedLocations,
        filteredMessages,
        locationFilteredMessages,
        selectedMessage,
        setSelectedMessage,
        selectedDanmakuItem,
      })}
    </>
  );
};

export default WallDataProvider;
