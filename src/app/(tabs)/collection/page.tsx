import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-main)]">
        Collection
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        这里先放 Collection 页占位。
      </p>
      <div>
        <Link
          href="/collection/studio"
          className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Open Dressing Room
        </Link>
      </div>
    </div>
  );
}

