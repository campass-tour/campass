import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WallSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  placeholder?: string;
  showMeta?: boolean;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  clearButtonClassName?: string;
  metaClassName?: string;
}

export const WallSearchBar: React.FC<WallSearchBarProps> = ({
  value,
  onValueChange,
  onClear,
  resultCount,
  totalCount,
  placeholder = 'Search by text, author, or location...',
  showMeta = true,
  className,
  inputClassName,
  iconClassName,
  clearButtonClassName,
  metaClassName,
}) => {
  const hasValue = value.trim().length > 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        <Search
          className={cn(
            'absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--wall-control-muted)]',
            iconClassName
          )}
          aria-hidden="true"
        />
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClear();
          }}
          placeholder={placeholder}
          aria-label="Search messages"
          className={cn(
            'h-11 w-full rounded-full border border-[var(--wall-search-input-border)] bg-[var(--wall-search-input-bg)] pl-11 pr-11 text-sm font-medium text-[var(--wall-search-input-text)] placeholder:text-[var(--wall-search-placeholder)] outline-none transition-[box-shadow,background-color,border-color] focus:border-[var(--wall-search-input-border)] focus-visible:ring-0',
            inputClassName
          )}
        />
        {hasValue && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={cn(
              'absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--wall-control-muted)] transition-colors hover:bg-[var(--wall-search-clear-hover)] hover:text-[var(--wall-search-input-text)]',
              clearButtonClassName
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showMeta && (
        <div
          className={cn(
            'mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]',
            metaClassName
          )}
        >
          <span>
            {resultCount}
            {resultCount === 1 ? ' result' : ' results'}
            {hasValue && totalCount !== resultCount ? ` (of ${totalCount})` : ''}
          </span>
          {hasValue && <span className="hidden sm:inline">Press Esc to clear</span>}
        </div>
      )}
    </div>
  );
};

export default WallSearchBar;
