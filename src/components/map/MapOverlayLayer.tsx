import React, { type ReactNode } from 'react';

interface MapOverlayLayerProps {
  children: ReactNode;
}

/**
 * A wrapper component that perfectly covers the map image.
 * Any child placed inside this layer can use simple percentage values (e.g. left: '25%', top: '35%')
 * and it will position dynamically aligned exactly with the image's coordinate system,
 * regardless of zoom state or aspect ratio changes.
 */
export const MapOverlayLayer: React.FC<MapOverlayLayerProps> = ({ children }) => {
  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
};
