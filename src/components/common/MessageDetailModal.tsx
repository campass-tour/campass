import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { createPortal } from 'react-dom';
import { X, MapPin, Trash2, MessageCircle, Send } from 'lucide-react';
import type { DanmakuItem } from '../wall/Danmaku';
import { getLocationData } from '../../constants/locations';
import { isCollectibleUnlocked } from '../../lib/storage';
import { ImageViewer } from './ImageViewer';
import { Button } from '../ui/button';
import commentDataRaw from '../../data/comments.json';

// Defined types for comments
export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CommentDataMap {
  [msgId: string]: Comment[];
}

const COMMENTS_DB: CommentDataMap = commentDataRaw as CommentDataMap;

interface MessageDetailModalProps {
  item: DanmakuItem | null;
  onClose: () => void;
  showDeleteIcon?: boolean;
  onDelete?: () => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({ item, onClose, showDeleteIcon = false, onDelete }) => {
  // 判断是否为移动端
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  // ImageViewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  // Comment compose drawer state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      // Load comments for this message using message.id directly
      const msgId = item.originalMessage.id;
      setComments(COMMENTS_DB[msgId] || []);
    } else {
      document.body.style.overflow = '';
      setIsComposeOpen(false);
      setNewCommentText('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const locationData = getLocationData(item.originalMessage.locationId);
  const isUnlocked = isCollectibleUnlocked(item.originalMessage.locationId);
  const locationName = isUnlocked && locationData ? locationData.locationName : 'Mysterious Location';

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: 'You', // TODO: Get from current user info
      text: newCommentText.trim(),
      timestamp: new Date().toISOString()
    };
    
    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
    setIsComposeOpen(false);
  };

  const renderComposeDrawer = () => {
    if (!isComposeOpen) return null;
    
    return createPortal(
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[25000] flex ${isMobile ? 'items-end' : 'items-center justify-center'} animate-in fade-in duration-200`}
        onClick={() => setIsComposeOpen(false)}
      >
        <div 
          className={`bg-[var(--color-surface)] w-full shadow-lg flex flex-col p-4 animate-in slide-in-from-bottom-full duration-300 ${isMobile ? 'rounded-t-[var(--radius-card)]' : 'max-w-sm rounded-[var(--radius-card)]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-[var(--font-weight-bold)] text-[var(--color-text-main)] text-[var(--font-size-h2)]">Write a comment</h3>
            <button onClick={() => setIsComposeOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] bg-[var(--color-background)] rounded-full p-1">
              <X size={20} />
            </button>
          </div>
          <textarea
            autoFocus
            className="w-full min-h-[120px] bg-[var(--color-background)] border border-[var(--border)] rounded-[var(--radius-button)] p-3 text-[var(--color-text-main)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] outline-none resize-none"
            placeholder="Share your thoughts..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddComment} className="flex items-center justify-center gap-2 rounded-full px-6 bg-[var(--color-primary)] text-white hover:opacity-90">
              <Send size={16} />
              Post
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const portalContent = createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 danmaku-modal-overlay"
      style={isMobile ? { pointerEvents: 'none', zIndex: 20000 } : { zIndex: 20000 }}
    >
      <div className="absolute inset-0 cursor-default select-none" />

      <div
        className="w-full max-w-sm max-h-[85vh] overflow-hidden bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] relative flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        style={isMobile ? { pointerEvents: 'auto' } : {}}
      >
        {/* Header section (fixed at top) */}
        <div className="flex-shrink-0 p-5 pb-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors focus:outline-none bg-[var(--color-background)] rounded-full p-1 z-10"
          >
            <X size={20} />
          </button>

          {showDeleteIcon && (
            <button
              onClick={onDelete}
              className="absolute top-4 right-12 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors focus:outline-none bg-[var(--color-background)] rounded-full p-1 z-10"
            >
              <Trash2 size={20} />
            </button>
          )}

          <div className="flex items-center gap-3 pr-8 w-full">
            {item.avatar ? (
              <LazyLoadImage
                src={item.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-[var(--radius-pill)] object-cover flex-shrink-0 bg-gray-200"
                effect="blur"
              />
            ) : (
              <div className="w-12 h-12 rounded-[var(--radius-pill)] bg-[var(--color-primary)] flex flex-shrink-0 items-center justify-center text-white font-[var(--font-weight-bold)] text-[16px]">
                {item.originalMessage.author.username?.substring(0, 1).toUpperCase() || 'A'}
              </div>
            )}
            <div className="flex flex-col max-w-[calc(100%-60px)]">
              <span className="font-[var(--font-weight-bold)] text-[var(--color-text-main)] text-[var(--font-size-body)] truncate">
                {item.originalMessage.author.username || (item.avatar ? "Random Visitor" : "Anonymous")}
              </span>
              <span className="text-[var(--color-text-secondary)] text-[var(--font-size-caption)] truncate">
                {new Date(item.originalMessage.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable content section */}
        <div className="overflow-y-auto w-full p-5 pt-4 flex-1 flex flex-col gap-4 overscroll-contain">
          <div className="text-[var(--color-text-main)] font-[var(--font-weight-regular)] text-[var(--font-size-body)] whitespace-pre-wrap leading-relaxed py-2">
            {item.text}
          </div>

          <div className="location-badge self-start">
            <MapPin className="location-badge-pin" />
            {locationName}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-background)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span className="text-sm font-medium">{item.originalMessage.likes}</span>
            </button>
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-background)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
          </div>

          {item.rightImage && (
            <div
              className="w-full h-48 rounded-[var(--radius-button)] overflow-hidden bg-gray-100 mt-2 shadow-sm cursor-pointer flex-shrink-0"
              onClick={() => {
                if (import.meta.env.DEV) console.log('MessageDetailModal: open image viewer', item.rightImage);
                setViewerOpen(true);
              }}
            >
              <LazyLoadImage
                src={item.rightImage}
                alt="attachment"
                className="w-full h-full object-cover"
                effect="blur"
              />
            </div>
          )}
          
          <hr className="border-[var(--border)] my-2" />
          
          <div className="flex flex-col gap-4">
            <h3 className="font-[var(--font-weight-bold)] text-[var(--color-text-main)] text-[var(--font-size-body)]">Comments</h3>
            
            {comments.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                <MessageCircle size={32} className="opacity-20 mb-2" />
                <p className="text-sm">There are no comments yet.</p>
                <p className="text-xs mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-pill)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex-shrink-0 flex items-center justify-center font-[var(--font-weight-bold)] text-xs">
                      {comment.author.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col bg-[var(--color-background)] p-3 rounded-2xl rounded-tl-sm w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[var(--font-weight-semibold)] text-[var(--font-size-caption)] text-[var(--color-text-main)]">{comment.author}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">{new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[var(--font-size-body)] text-[var(--color-text-main)]">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions fixed at bottom */}
        <div className="p-4 pt-3 border-t border-[var(--border)] flex-shrink-0 bg-[var(--color-surface)]">
          <Button 
            className="w-full rounded-full bg-[var(--color-background)] text-[var(--color-text-main)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors border border-[var(--border)] flex items-center justify-center gap-2"
            onClick={() => setIsComposeOpen(true)}
            variant="ghost"
          >
            <MessageCircle size={18} />
            Write a comment...
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );

  return (
    <>
      {portalContent}
      {renderComposeDrawer()}
      <ImageViewer
        images={item?.rightImage ? [item.rightImage] : []}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
};