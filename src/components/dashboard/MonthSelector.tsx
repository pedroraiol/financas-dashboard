import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLong } from "../../utils/date";

export default function MonthSelector({
  monthKey,
  onPrevious,
  onNext,
}: {
  monthKey: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-ink-muted/30 px-1 py-1">
      <button
        onClick={onPrevious}
        aria-label="Mês anterior"
        className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[140px] text-center text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
        {formatMonthLong(monthKey)}
      </span>
      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
