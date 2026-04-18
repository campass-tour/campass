import { useEffect, useState, type MouseEventHandler } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const bubblesUrl = '/image/bubbles.svg';

type MascotCardProps = {
  name: string;
  location: string;
  image?: string;
  status: 'locked' | 'unlocked' | 'new';
};

export default function MascotCard({
  name,
  location,
  image,
  status,
}: MascotCardProps) {
  const isLocked = status === 'locked';
  const isNew = status === 'new';
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isLocked || typeof window === 'undefined') return;

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isMobile) {
      setParallax({ x: 0, y: 0 });
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      const y = Math.max(-20, Math.min(20, (beta - 45) / 2));
      const x = Math.max(-20, Math.min(20, gamma / 2));
      setParallax({ x, y });
    };

    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
          if (permission !== 'granted') return;
        } catch {
          return;
        }
      }
      window.addEventListener('deviceorientation', handleOrientation);
    };

    void requestPermission();
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isLocked]);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isLocked) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rotateY = ((offsetX / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - (offsetY / rect.height)) * 10;
    setPointerTilt({ x: rotateX, y: rotateY });
  };

  const resetTilt = () => {
    setPointerTilt({ x: 0, y: 0 });
    setIsHovering(false);
  };

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl border border-[var(--glass-card-border)] bg-[var(--glass-card-bg)] p-4 shadow-[var(--glass-card-shadow)] backdrop-blur-md transition-all duration-300 ease-out ${
        isLocked ? 'opacity-75 grayscale' : 'hover:shadow-[var(--glass-card-shadow-hover)]'
      } ${isNew ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
      style={{
        transform: isLocked
          ? 'none'
          : `perspective(1200px) rotateX(${pointerTilt.x}deg) rotateY(${pointerTilt.y}deg) scale(${isHovering ? 1.03 : 1})`,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={resetTilt}
    >
      <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--glass-card-border)] bg-[var(--mascot-card-image-bg)]">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle at 50% 44%, var(--mascot-halo-core) 0%, var(--mascot-halo-mid) 36%, var(--mascot-halo-edge) 72%, transparent 100%)`,
            transition: 'background-position 0.3s cubic-bezier(.4,2,.6,1)',
            backgroundSize: '200% 200%',
            backgroundPosition: `calc(50% + ${parallax.x * 0.7}px) calc(50% + ${parallax.y * 0.7}px)`,
          }}
        />

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundImage: `url(${bubblesUrl})`,
            backgroundRepeat: 'repeat',
            opacity: 0.25,
          }}
        />

        <div
          className="relative z-20 flex h-full w-full items-center justify-center transition-transform duration-100 ease-out will-change-transform"
          style={{
            perspective: '800px',
            transform: !isLocked
              ? `rotateX(${-parallax.y * 1.5}deg) rotateY(${parallax.x * 1.5}deg) translateZ(40px) scale(${isHovering ? 1.08 : 1.05})`
              : 'translateY(10px) scale(1)',
            filter: !isLocked
              ? `drop-shadow(${parallax.x * -0.5}px ${parallax.y * 0.5 + 10}px 18px var(--mascot-figure-shadow))`
              : 'drop-shadow(0px 5px 5px var(--mascot-figure-shadow-muted))',
          }}
        >
          {image ? (
            <LazyLoadImage
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              effect="blur"
            />
          ) : (
            <div className="text-xl font-bold tracking-[0.22em] text-[var(--mascot-fallback-text)]">
              {isLocked ? 'LOCKED' : 'MASCOT'}
            </div>
          )}
        </div>

        <span
          className={`absolute right-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm transition-colors duration-300 ${
            isLocked
              ? 'bg-[var(--mascot-badge-locked-bg)] text-[var(--mascot-badge-locked-text)]'
              : isNew
              ? 'bg-[var(--mascot-badge-new-bg)] text-[var(--mascot-badge-text)]'
              : 'bg-[var(--mascot-badge-bg)] text-[var(--mascot-badge-text)]'
          }`}
        >
          {isLocked ? 'Locked' : isNew ? 'New' : 'Unlocked'}
        </span>

        {!isLocked && (
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,var(--mascot-overlay-bottom),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
      </div>

      <div className="flex flex-col gap-1 transition-transform duration-500">
        <h3 className="line-clamp-1 text-lg font-bold text-[var(--color-text-main)] transition-colors duration-300 group-hover:text-[var(--color-primary)]">
          {isLocked ? '???' : name}
        </h3>

        <p className="line-clamp-1 flex items-center gap-1.5 text-sm font-medium text-[var(--mascot-location-text)] opacity-90 transition-opacity duration-300 group-hover:opacity-100">
          {!isLocked && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          {isLocked ? 'Unknown location' : location}
        </p>
      </div>
    </div>
  );
}
