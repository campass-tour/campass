import { MapViewer } from '@/components/map/MapViewer';

export default function Page() {
  return (
    <MapViewer
      className="h-full min-h-0 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-[var(--color-state-disabled)]"
      initialScale={0.6}
    />
  );
}
