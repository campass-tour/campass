'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type NextLinkProps = ComponentProps<typeof Link>;

export function ReactRouterDomLink(props: {
  to: string;
  children?: ReactNode;
} & Omit<NextLinkProps, 'href'>) {
  const { to, children, ...rest } = props;
  return (
    <Link href={to} {...rest}>
      {children}
    </Link>
  );
}

// Re-export under the name expected by existing code.
export { ReactRouterDomLink as Link };

// Minimal placeholder to avoid breaking legacy imports during migration.
export function useSearchParams(): [URLSearchParams] {
  if (typeof window === 'undefined') return [new URLSearchParams()];
  return [new URLSearchParams(window.location.search)];
}
