export type HapticPattern = 'quiz_correct' | 'quiz_wrong' | 'card_unlock';

export function triggerHaptic(pattern: HapticPattern): void {
  if (typeof window === 'undefined') return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  const vibrationPattern: number | number[] =
    pattern === 'quiz_correct'
      ? 18
      : pattern === 'quiz_wrong'
        ? [30, 40, 30]
        : [24, 32, 16];

  navigator.vibrate(vibrationPattern);
}
