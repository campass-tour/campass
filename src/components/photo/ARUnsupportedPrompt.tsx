import { AlertCircle } from 'lucide-react';

type ARUnsupportedPromptProps = {
  message?: string;
  title?: string;
};

export default function ARUnsupportedPrompt({
  message = "Sorry, your current device does not support AR features. Please try on a compatible mobile device.",
  title = "Device Not Supported",
}: ARUnsupportedPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface)] rounded-[16px] border border-[var(--color-primary)]/10 shadow-[var(--shadow-card)] mx-6 text-[var(--color-text-main)] max-w-sm" style={{ zIndex: 'var(--z-overlay)' }}>
      <AlertCircle className="h-16 w-16 text-[var(--color-accent)] mb-4" />
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
    </div>
  );
}
