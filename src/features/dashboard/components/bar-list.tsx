export interface BarListItem {
  key: string;
  label: string;
  /** Bar length is relative to the largest `value`. */
  value: number;
  display: string;
  color?: string;
  hint?: string;
}

/** Labelled horizontal bars, largest value = full width. */
export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(0, ...items.map((item) => item.value));

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1.5" title={item.hint}>
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="min-w-0 truncate text-neutral-700 dark:text-neutral-300">{item.label}</span>
            <span className="font-semibold tabular-nums text-neutral-950 dark:text-white">
              {item.display}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full"
              style={{
                width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                background: item.color ?? "#2563EB",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
