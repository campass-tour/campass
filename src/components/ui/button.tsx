'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-[var(--color-primary)] text-white hover:opacity-90',
  outline:
    'border border-[var(--border)] bg-[var(--color-background)] text-[var(--color-text-main)] hover:bg-black/5',
  secondary: 'bg-black/5 text-[var(--color-text-main)] hover:bg-black/10',
  ghost: 'bg-transparent text-[var(--color-text-main)] hover:bg-black/5',
  destructive: 'bg-red-500/10 text-red-600 hover:bg-red-500/15',
  link: 'bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4',
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10 p-0',
  'icon-xs': 'h-7 w-7 p-0',
  'icon-sm': 'h-8 w-8 p-0',
  'icon-lg': 'h-11 w-11 p-0',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

