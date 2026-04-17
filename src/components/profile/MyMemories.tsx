'use client';

import React, { useMemo, useState } from 'react';
import { BookHeart } from 'lucide-react';
import { MESSAGES } from '../../constants/messages';
import type { DanmakuItem } from '../wall/Danmaku';
import { MessageDetailModal } from '../common/MessageDetailModal';
import PolaroidCard from '../wall/PolaroidCard';

/* timestamp formatter removed (unused) */


// DanmakuItem type (copied from Danmaku.tsx for reference)
// export interface DanmakuItem {
//   id: string; text: string; avatar?: string; rightImage?: string; top: number; duration: number; originalMessage: Message;
// }

export const MyMemories: React.FC = () => {
  // For now use authorId === 1 as the current user (data/users.json)
  const currentUserId = 1;
  const userMessages = useMemo(
    () => MESSAGES.filter((m) => m.authorId === currentUserId || m.author.username === 'silly bird'),
    []
  );
  const [selectedItem, setSelectedItem] = useState<DanmakuItem | null>(null);

  return (
    <section className="w-full px-[var(--profile-memory-pad-x)] py-[var(--profile-memory-pad-y)]">
      <h3 className="m-0 mb-5 flex items-center gap-2 text-lg font-bold text-[var(--color-text-main)] md:text-xl">
        <BookHeart size={20} className="text-[var(--color-accent)]" />
        Memories & Echoes
      </h3>

      {userMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--profile-content-divider)] py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--profile-content-divider)] bg-[var(--profile-empty-icon-bg)]">
            <svg className="h-6 w-6 text-[var(--profile-empty-icon)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-[300px]">
            You haven't posted any memories yet.
          </p>
        </div>
      ) : (
        <div className="max-h-[72vh] overflow-auto px-6 md:px-10 pt-6 md:pt-8">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4" style={{ columnGap: '2.5rem' }}>
            {userMessages.map((msg, idx) => (
              <div className="mb-6" key={msg.id}>
                <PolaroidCard
                  message={msg}
                  index={idx}
                  onClick={() => {
                    // Convert to DanmakuItem shape for MessageDetailModal
                    setSelectedItem({
                      id: msg.id,
                      text: msg.content,
                      avatar: msg.author.avatarUrl,
                      rightImage: msg.imageUrl,
                      top: 0,
                      duration: 0,
                      originalMessage: msg,
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <MessageDetailModal
        item={selectedItem} 
        onClose={() => setSelectedItem(null)}
        showDeleteIcon={selectedItem?.originalMessage.author.username === 'silly bird'}
      />
    </section>
  );
};
