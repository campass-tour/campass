import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RoundedDropdownOption {
  value: string;
  label: string;
  meta?: string;
}

interface RoundedDropdownProps {
  label: string;
  value: string;
  options: RoundedDropdownOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

export const RoundedDropdown: React.FC<RoundedDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  className,
  triggerClassName,
  panelClassName,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'inline-flex h-12 min-w-[240px] items-center gap-3 rounded-[22px] border border-[var(--wall-select-border)] bg-[var(--wall-select-bg)] px-4 text-left text-sm text-[var(--wall-pill-text)] shadow-[var(--wall-select-shadow)] transition-[border-color,box-shadow,transform] hover:border-[var(--wall-select-border-strong)] hover:shadow-[var(--wall-select-shadow-hover)] focus-visible:outline-none focus-visible:ring-0',
          open && 'border-[var(--wall-select-border-strong)] shadow-[var(--wall-select-shadow-hover)]',
          triggerClassName
        )}
      >
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--wall-select-icon-bg)] text-[var(--wall-select-icon-text)]">
            {icon}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--wall-select-kicker)]">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-[var(--wall-pill-text)]">
            {selected?.label}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--wall-control-muted)] transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-[calc(100%+12px)] z-40 min-w-[280px] overflow-hidden rounded-[26px] border border-[var(--wall-dropdown-border)] bg-[var(--wall-dropdown-bg)] p-2 shadow-[var(--wall-dropdown-shadow)] backdrop-blur-xl',
            panelClassName
          )}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-80 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-colors',
                    isSelected
                      ? 'bg-[var(--wall-dropdown-active-bg)] text-[var(--wall-dropdown-active-text)]'
                      : 'text-[var(--wall-dropdown-text)] hover:bg-[var(--wall-dropdown-hover)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                      isSelected
                        ? 'border-transparent bg-[var(--wall-dropdown-active-icon-bg)] text-[var(--wall-dropdown-active-icon-text)]'
                        : 'border-[var(--wall-dropdown-icon-border)] bg-[var(--wall-dropdown-icon-bg)] text-[var(--wall-dropdown-icon-text)]'
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{option.label}</span>
                    {option.meta && (
                      <span
                        className={cn(
                          'mt-0.5 block truncate text-xs',
                          isSelected ? 'text-[var(--wall-dropdown-active-meta)]' : 'text-[var(--wall-dropdown-meta)]'
                        )}
                      >
                        {option.meta}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundedDropdown;
