import type { TooltipProps } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { useFinanceStore } from "../../store/useFinanceStore";

interface Props extends TooltipProps<number, string> {
  labelFormatter?: (label: string) => string;
}

export default function ChartTooltip({ active, payload, label, labelFormatter }: Props) {
  const currency = useFinanceStore((s) => s.settings.currency);

  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark px-3 py-2.5 text-xs shadow-lg">
      {label !== undefined && (
        <p className="mb-1.5 font-medium text-ink-primary-light dark:text-ink-primary-dark">
          {labelFormatter ? labelFormatter(String(label)) : label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-ink-secondary-light dark:text-ink-secondary-dark">
              {entry.name}
            </span>
            <span className="ml-auto font-medium tabular text-ink-primary-light dark:text-ink-primary-dark">
              {formatCurrency(Number(entry.value), currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
