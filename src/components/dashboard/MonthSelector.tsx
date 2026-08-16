import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLong } from "../../utils/date";
import clsx from "../../utils/clsx";

const MONTH_ABBR = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

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
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => Number(monthKey.slice(0, 4)));
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedYear = Number(monthKey.slice(0, 4));
  const selectedMonth = Number(monthKey.slice(5, 7));

  const openPicker = () => {
    setPickerYear(selectedYear);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 rounded-lg border border-ink-muted/30 px-1 py-1"
    >
      <button
        onClick={onPrevious}
        aria-label="Mês anterior"
        className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="true"
        aria-expanded={open}
        className="min-w-[140px] rounded-md px-1 py-1 text-center text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        {formatMonthLong(monthKey)}
      </button>
      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronRight size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPickerYear((y) => y - 1)}
              aria-label="Ano anterior"
              className="rounded-md p-1 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
              {pickerYear}
            </span>
            <button
              type="button"
              onClick={() => setPickerYear((y) => y + 1)}
              aria-label="Próximo ano"
              className="rounded-md p-1 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {MONTH_ABBR.map((label, i) => {
              const m = i + 1;
              const isSelected = pickerYear === selectedYear && m === selectedMonth;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    onSelectMonth(`${pickerYear}-${String(m).padStart(2, "0")}`);
                    setOpen(false);
                  }}
                  className={clsx(
                    "rounded-md py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-series-1 text-white"
                      : "text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
