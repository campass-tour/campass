import React from 'react';

interface MapFilterProps {
  availableLevels?: number[];
  selectedLevels?: number[] | null; // null = all
  onChange?: (levels: number[] | null) => void;
}

export const MapFilter: React.FC<MapFilterProps> = ({ availableLevels = [1, 2], selectedLevels = null, onChange }) => {
  const isAll = selectedLevels === null;

  const toggleLevel = (lv: number) => {
    if (!onChange) return;
    if (selectedLevels === null) {
      // currently all -> select the single level
      onChange([lv]);
      return;
    }

    if (selectedLevels.includes(lv)) {
      const next = selectedLevels.filter(x => x !== lv);
      onChange(next.length ? next : null);
    } else {
      onChange([...selectedLevels, lv]);
    }
  };

  return (
    <div className="absolute right-4 top-4 z-20 flex gap-2 items-center pointer-events-auto">
      <div className="bg-[var(--color-surface)] p-2 rounded-xl shadow-[var(--shadow-card)] border border-[var(--border)] flex gap-2">
        <button
          className={`px-3 py-1 rounded-md ${isAll ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-text-main)]'}`}
          onClick={() => onChange?.(null)}
        >
          All
        </button>
        {availableLevels.map(lv => {
          const active = !isAll && !!selectedLevels && selectedLevels.includes(lv);
          return (
            <button
              key={lv}
              className={`px-3 py-1 rounded-md ${active ? 'bg-[var(--color-accent)] text-white' : 'bg-transparent text-[var(--color-text-main)]'}`}
              onClick={() => toggleLevel(lv)}
            >
              LV{lv}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapFilter;
