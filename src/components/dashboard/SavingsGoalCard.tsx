import Card from "../ui/Card";
import { formatCurrency, formatPercent } from "../../utils/currency";
import { useFinanceStore } from "../../store/useFinanceStore";

export default function SavingsGoalCard({ balance, goal }: { balance: number; goal: number }) {
  const currency = useFinanceStore((s) => s.settings.currency);
  const progress = goal > 0 ? Math.max(0, Math.min(1, balance / goal)) : 0;
  const reached = balance >= goal;

  return (
    <Card title="Meta de economia mensal" subtitle={`Meta: ${formatCurrency(goal, currency)}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-secondary-light dark:text-ink-secondary-dark">
          Economizado: <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{formatCurrency(Math.max(balance, 0), currency)}</span>
        </span>
        <span className={reached ? "font-medium text-status-good" : "font-medium text-series-1"}>
          {formatPercent(progress)}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-series-1/15">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: reached ? "var(--status-good)" : "var(--series-1)",
          }}
        />
      </div>
      {reached && <p className="mt-2 text-xs text-status-good">Meta batida neste mês. Parabéns!</p>}
    </Card>
  );
}
