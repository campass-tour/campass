import * as React from 'react';

export type LucideIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export type LucideIcon = React.FC<LucideIconProps>;

function createLucideIcon(displayName: string, paths: React.ReactNode): LucideIcon {
  const Icon: LucideIcon = ({ size, width, height, children, ...props }) => {
    const resolved = size ?? width ?? height ?? 24;
    return (
      <svg
        viewBox="0 0 24 24"
        width={resolved}
        height={resolved}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        <title>{displayName}</title>
        {paths}
        {children}
      </svg>
    );
  };

  Icon.displayName = displayName;
  return Icon;
}

export const X = createLucideIcon(
  'X',
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);

export const Plus = createLucideIcon(
  'Plus',
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const Check = createLucideIcon('Check', <path d="M20 6 9 17l-5-5" />);

export const ChevronDown = createLucideIcon('ChevronDown', <path d="m6 9 6 6 6-6" />);

export const Sun = createLucideIcon(
  'Sun',
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </>
);

export const Moon = createLucideIcon('Moon', <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);

export const MapPin = createLucideIcon(
  'MapPin',
  <>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const PenSquare = createLucideIcon(
  'PenSquare',
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>
);

export const MessageCircle = createLucideIcon(
  'MessageCircle',
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
);

export const Trash2 = createLucideIcon(
  'Trash2',
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>
);

export const Send = createLucideIcon(
  'Send',
  <>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </>
);

export const Heart = createLucideIcon(
  'Heart',
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
);

export const Search = createLucideIcon(
  'Search',
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>
);

export const Image = createLucideIcon(
  'Image',
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </>
);

export const Map = createLucideIcon(
  'Map',
  <>
    <path d="m3 6 6-2 6 2 6-2v15l-6 2-6-2-6 2Z" />
    <path d="M9 4v15" />
    <path d="M15 6v15" />
  </>
);

export const MessageSquare = createLucideIcon(
  'MessageSquare',
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
);

export const User = createLucideIcon(
  'User',
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

export const CircleUserRound = createLucideIcon(
  'CircleUserRound',
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6 20a6 6 0 0 1 12 0" />
  </>
);

export const Backpack = createLucideIcon(
  'Backpack',
  <>
    <path d="M6 8a6 6 0 0 1 12 0v12H6Z" />
    <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M8 16h8" />
    <path d="M8 12h8" />
  </>
);

export const SmartphoneNfc = createLucideIcon(
  'SmartphoneNfc',
  <>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
    <path d="M4 12c2 0 2-4 0-4" />
    <path d="M20 8c-2 0-2 4 0 4" />
  </>
);

export const GraduationCap = createLucideIcon(
  'GraduationCap',
  <>
    <path d="M22 10 12 4 2 10l10 6 10-6Z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
    <path d="M22 10v6" />
  </>
);

export const Camera = createLucideIcon(
  'Camera',
  <>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" />
    <circle cx="12" cy="13" r="3" />
  </>
);
