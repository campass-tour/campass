import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { createPortal } from 'react-dom';
import { MessageDetailModal } from '../common/MessageDetailModal';
import { getMessagesByLocation } from '../../constants/messages';
import type { Message } from '../../types';

export interface DanmakuItem {
  id: string; // use message id
  text: string;
  avatar?: string;
  rightImage?: string;
  top: number;
  duration: number;
  originalMessage: Message;
}

export const Danmaku: React.FC<{ isActive: boolean; locationId: string }> = ({ isActive, locationId }) => {
  const [items, setItems] = useState<DanmakuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DanmakuItem | null>(null);

  useEffect(() => {
    if (!isActive || !locationId) {
      setItems([]);
      return;
    }

    const messages = getMessagesByLocation(locationId);
    if (messages.length === 0) return;

    let messageIndex = 0;
    // 控制同屏最大弹幕数
    const MAX_ON_SCREEN = 3;
    // Play danmaku occasionally
    const spawnDanmaku = () => {
      if (messages.length === 0) return;
      setItems(prev => {
        if (prev.length >= MAX_ON_SCREEN) return prev;
        const message = messages[messageIndex % messages.length];
        messageIndex++;
        const text = message.content;
        const avatar = message.author.avatarUrl;
        const rightImage = message.imageUrl;
        // 让弹幕分布更均匀
        const usedTops = prev.map(i => i.top);
        let top: number;
        let tries = 0;
        do {
          top = 10 + Math.random() * 30;
          tries++;
        } while (usedTops.some(t => Math.abs(t - top) < 12) && tries < 10);
        const duration = 7 + Math.random() * 3;
        const newItem: DanmakuItem = {
          id: message.id + '_' + Date.now(),
          text,
          avatar,
          rightImage,
          top,
          duration,
          originalMessage: message
        };
        setTimeout(() => {
          setItems(cur => cur.filter(item => item.id !== newItem.id));
        }, duration * 1000 + 500);
        return [...prev, newItem];
      });
    };

    // 初始只生成一条
    spawnDanmaku();
    // 之后每2.2秒尝试生成一条
    const interval = setInterval(() => {
      spawnDanmaku();
    }, 2200);

    return () => {
      clearInterval(interval);
      setItems([]);
    };
  }, [isActive, locationId]);

  if (!isActive) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden danmaku-overlay">
        <style>
          {`
            @keyframes slide-left {
              from { transform: translateX(100vw); }
              to { transform: translateX(-100%); }
            }
          `}
        </style>
        
        {items.map(item => (
          <div 
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(item);
            }}
            className="absolute flex items-center pl-1 pr-[var(--spacing-3)] py-1 bg-[var(--color-surface)] shadow-[var(--shadow-card)] rounded-[var(--radius-pill)] gap-[var(--spacing-2)] whitespace-nowrap pointer-events-auto cursor-pointer hover:bg-[var(--color-background)] transition-colors danmaku-item"
            style={{ 
              top: `${item.top}%`, 
              left: 0,
              animation: `slide-left ${item.duration}s linear forwards`
            }}
          >
          {/* The Circular Avatar is positioned at the leftmost end */}
          {item.avatar ? (
            <LazyLoadImage
              src={item.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-[var(--radius-pill)] object-cover flex-shrink-0 bg-gray-200"
              effect="blur"
            />
          ) : (
            <div className="w-8 h-8 rounded-[var(--radius-pill)] bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 text-white font-[var(--font-weight-bold)] text-[12px]">
              {item.originalMessage?.author?.username?.substring(0, 1).toUpperCase() || 'A'}
            </div>
          )}
          {/* Constrain length with truncation to force a single line display */}
          <span className="text-[var(--color-text-main)] font-[var(--font-weight-semibold)] text-[var(--font-size-body)] truncate max-w-[320px]">
            {item.text}
          </span>
          {/* Optional right-side image */}
          {item.rightImage && (
            <LazyLoadImage
              src={item.rightImage}
              alt="danmaku-right"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-gray-200 ml-2"
              effect="blur"
            />
          )}
        </div>
      ))}
      </div>
      
      <MessageDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)}
        showDeleteIcon={selectedItem?.originalMessage.author.username === 'silly bird'}
      />
    </>,
    document.body
  );
};
