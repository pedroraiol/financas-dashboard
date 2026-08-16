import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLong } from "../../utils/date";

export default function MonthSelector({
  monthKey,
  onPrevious,
  onNext,
  onSelectMonth,
}: {
  monthKey: string;
  onPrevious: () => void;
  onNext: () => void;
  onSelectMonth: (monthKey: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-ink-muted/30 px-1 py-1">
      <button
        onClick={onPrevious}
        aria-label="Mês anterior"
        className="relative z-10 rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="pointer-events-none min-w-[140px] text-center text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
        {formatMonthLong(monthKey)}
      </span>
      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="relative z-10 rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronRight size={16} />
      </button>
      <input
        type="month"
        value={monthKey}
        onChange={(e) => e.target.value && onSelectMonth(e.target.value)}
        aria-label="Ir direto para um mês"
        title="Ir direto para um mês"
        className="absolute inset-0 z-0 cursor-pointer opacity-0"
      />
    </div>
  );
}
