import Card from "../ui/Card";
import clsx from "../../utils/clsx";
import { formatCurrency } from "../../utils/currency";
import { formatDateShort } from "../../utils/date";
import { EXPENSE_CATEGORY_ICONS, INCOME_CATEGORY_ICONS } from "../../utils/categoryIcons";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "../../types";
import type { ActivityItem } from "../../utils/calculations";
import type { AppSettings } from "../../types";

export default function RecentActivity({
  items,
  currency,
}: {
  items: ActivityItem[];
  currency: AppSettings["currency"];
}) {
  return (
    <Card title="Atividade recente" subtitle="Mês selecionado">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          Nenhuma movimentação neste mês.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
          {items.map((item) => {
            const isIncome = item.kind === "income";
            const Icon = isIncome
              ? INCOME_CATEGORY_ICONS[item.category]
              : EXPENSE_CATEGORY_ICONS[item.category];
            const label = isIncome
              ? INCOME_CATEGORY_LABELS[item.category]
              : EXPENSE_CATEGORY_LABELS[item.category];

            return (
              <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 py-3">
                <div
                  className={clsx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    isIncome
                      ? "bg-status-good/10 text-status-good"
                      : "bg-status-critical/10 text-status-critical",
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
                    {label} · {formatDateShort(item.date)}
                  </p>
                </div>
                <span
                  className={clsx(
                    "tabular shrink-0 text-sm font-semibold",
                    isIncome ? "text-status-good" : "text-status-critical",
                  )}
                >
                  {isIncome ? "+" : "−"} {formatCurrency(item.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
