import { Navigation } from 'lucide-react';

interface UserPositionIndicatorProps {
  userPosition: {
    x: number; // percentage from left
    y: number; // percentage from top
    heading: number; // degrees
  };
}

export function UserPositionIndicator({ userPosition }: UserPositionIndicatorProps) {
  return (
    <div 
      id="user-position-marker"
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${userPosition.x}%`,
        top: `${userPosition.y}%`,
        transform: "translate(-50%, -50%) scale(var(--map-inv-scale, 1))",
        transition: "left 300ms ease-out, top 300ms ease-out"
      }}
    >
      <div className="relative flex items-center justify-center w-8 h-8">
        {/* Outer animated ping */}
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
        
        {/* Heading indicator */}
        <div 
          className="absolute w-full h-full transition-transform duration-300"
          style={{ transform: 'rotate(' + userPosition.heading + 'deg)' }}
        >
          <Navigation 
            size={18} 
            className="text-blue-600 drop-shadow-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            fill="currentColor"
            strokeWidth={1}
          />
        </div>
      </div>
    </div>
  );
}