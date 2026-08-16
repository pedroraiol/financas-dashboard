import { Pencil, Trash2 } from "lucide-react";
import type { FixedExpense, VariableExpense } from "../../types";
import { EXPENSE_CATEGORY_LABELS } from "../../types";
import { formatCurrency } from "../../utils/currency";
import { formatDateShort } from "../../utils/date";
import { useFinanceStore } from "../../store/useFinanceStore";
import Badge from "../ui/Badge";

interface Props<T extends FixedExpense | VariableExpense> {
  items: T[];
  accent: "series-2" | "series-3";
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

function isFixed(item: FixedExpense | VariableExpense): item is FixedExpense {
  return "startDate" in item;
}

export default function ExpenseList<T extends FixedExpense | VariableExpense>({
  items,
  accent,
  onEdit,
  onDelete,
}: Props<T>) {
  const currency = useFinanceStore((s) => s.settings.currency);
  const accentClass = accent === "series-2" ? "text-series-2" : "text-series-3";

  return (
    <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
                {item.name}
              </p>
              {isFixed(item) && !item.active && <Badge tone="neutral">Inativa</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
              {EXPENSE_CATEGORY_LABELS[item.category]}
              {isFixed(item)
                ? ` · desde ${formatDateShort(item.startDate)}${item.dueDay ? ` · vence dia ${item.dueDay}` : ""}`
                : ` · ${formatDateShort(item.date)}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className={`tabular text-sm font-semibold ${accentClass}`}>
              {formatCurrency(item.amount, currency)}
            </span>
            <button
              onClick={() => onEdit(item)}
              aria-label={`Editar ${item.name}`}
              className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(item)}
              aria-label={`Excluir ${item.name}`}
              className="rounded-md p-1.5 text-status-critical hover:bg-status-critical/10"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
