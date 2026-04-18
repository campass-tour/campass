import { useEffect } from 'react';
import {
  Coins,
  Heart,
  MapPin,
  MessageCircle,
  Rocket,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import type { WardrobeCreditsInfoContent } from '../../types';

type WardrobeStudioCreditsInfoDialogProps = {
  isOpen: boolean;
  content: WardrobeCreditsInfoContent;
  onClose: () => void;
  onPrimaryAction: () => void;
};

function formatCreditAmount(amount: number): string {
  return `${amount >= 0 ? '+' : ''}${amount}`;
}

function renderNamedIcon(iconName: string, className: string) {
  if (iconName === 'heart') return <Heart className={className} />;
  if (iconName === 'mapPin') return <MapPin className={className} />;
  if (iconName === 'messageCircle') return <MessageCircle className={className} />;
  if (iconName === 'rocket') return <Rocket className={className} />;
  return <Coins className={className} />;
}

export default function WardrobeStudioCreditsInfoDialog({
  isOpen,
  content,
  onClose,
  onPrimaryAction,
}: WardrobeStudioCreditsInfoDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const modalAttr = 'data-wardrobe-credits-dialog-open';
    const previousModalAttr = document.body.getAttribute(modalAttr);
    document.body.style.overflow = 'hidden';
    document.body.setAttribute(modalAttr, 'true');

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousModalAttr === null) {
        document.body.removeAttribute(modalAttr);
      } else {
        document.body.setAttribute(modalAttr, previousModalAttr);
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label={content.closeButtonAriaLabel}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] p-4 text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wall-select-icon-bg)] text-[var(--color-primary)]">
              {renderNamedIcon(content.headerIcon, 'h-4 w-4')}
            </span>
            <h2 className="text-base font-bold">{content.title}</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--collection-capsule-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
            aria-label={content.closeButtonAriaLabel}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--collection-progress-kicker)]">
            {content.howToEarnTitle}
          </h3>
          <ul className="space-y-2">
            {content.rules.map((rule) => (
              <li
                key={rule.id}
                className="grid grid-cols-[auto_1fr_auto] items-start gap-2 rounded-[var(--radius-button)] border border-[var(--collection-capsule-border)] bg-[var(--color-surface)] px-3 py-2"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wall-select-icon-bg)] text-[var(--color-primary)]">
                  {renderNamedIcon(rule.icon, 'h-4 w-4')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{rule.title}</p>
                  <p className="text-xs text-[var(--collection-progress-copy)]">{rule.description}</p>
                </div>
                <span className="text-xs font-bold text-[var(--color-primary)]">
                  {formatCreditAmount(rule.reward)} {content.creditsCompactLabel}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--collection-progress-kicker)]">
            {content.transactionHistoryTitle}
          </h3>
          {content.transactionHistory.length > 0 ? (
            <ul className="space-y-2">
              {content.transactionHistory.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-[var(--radius-button)] border border-[var(--collection-capsule-border)] bg-[var(--color-surface)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">{item.action}</p>
                    <p className="text-xs text-[var(--collection-progress-copy)]">{item.timeLabel}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {formatCreditAmount(item.amount)} {content.creditsCompactLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[var(--radius-button)] border border-dashed border-[var(--collection-capsule-border)] px-3 py-2 text-xs text-[var(--collection-progress-copy)]">
              {content.emptyTransactionHistoryLabel}
            </p>
          )}
        </section>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-surface)] shadow-[var(--collection-capsule-shadow)] transition-transform active:scale-[0.98]"
          aria-label={content.primaryAction.ariaLabel}
          onClick={onPrimaryAction}
        >
          {renderNamedIcon(content.primaryAction.icon, 'h-4 w-4')}
          <span>{content.primaryAction.label}</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
