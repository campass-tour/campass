import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import type { Message } from '../../types';
import { getLocationData } from '../../constants/locations';
import { isCollectibleUnlocked } from '../../lib/storage';
import { Heart, MapPin } from 'lucide-react';

const formatTimeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

const PolaroidCard: React.FC<{ message: Message; index: number; onClick: () => void }> = ({ message, index, onClick }) => {
  const rotationClass = `polaroid-rotate-${index % 4}`;

  const locationData = getLocationData(message.locationId);
  const isUnlocked = isCollectibleUnlocked(message.locationId);
  const locationName = isUnlocked && locationData ? locationData.locationName : 'Mysterious Location';

  return (
    <div className={`polaroid-wrapper ${rotationClass}`}>
      <div className="polaroid-card">
        <div className="polaroid-card-inner" onClick={onClick}>

        {message.imageUrl && (
          <div className="polaroid-image">
            <LazyLoadImage src={message.imageUrl} alt="Memory" className="w-full h-full object-cover" effect="blur" />
          </div>
        )}

        <div className="polaroid-content">
          <p className="polaroid-text">{message.content}</p>

          <div className="polaroid-author">
            {message.author.avatarUrl ? (
              <LazyLoadImage src={message.author.avatarUrl} alt={message.author.username} className="avatar" effect="blur" />
            ) : (
              <div className="avatar">{message.author.username.charAt(0).toUpperCase()}</div>
            )}
            <span className="polaroid-author-name">{message.author.username}</span>
          </div>

          <div className="polaroid-location">
            <MapPin className="polaroid-map-pin" />
            {locationName}
          </div>

          <div className="polaroid-meta">
            <span className="polaroid-time">{formatTimeAgo(message.timestamp)}</span>
            <div
              className="polaroid-like"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart className="heart w-4 h-4" />
              <span className="font-medium">{message.likes}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PolaroidCard;
