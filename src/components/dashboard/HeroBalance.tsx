import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Card from "../ui/Card";
import HelpTip from "../ui/HelpTip";
import clsx from "../../utils/clsx";
import { formatCurrency, formatPercent } from "../../utils/currency";
import type { MonthSummary } from "../../utils/calculations";
import type { AppSettings } from "../../types";

interface HeroBalanceProps {
  summary: MonthSummary;
  previousSummary?: MonthSummary;
  currency: AppSettings["currency"];
  goal: number | null;
}

function delta(current: number, previous: number, goodWhenUp = true) {
  if (previous === 0) return null;
  const pct = (current - previous) / Math.abs(previous);
  return { value: formatPercent(Math.abs(pct)), positive: pct >= 0, goodWhenUp };
}

function DeltaTag({ d }: { d: ReturnType<typeof delta> }) {
  if (!d) return null;
  const isGood = d.positive === d.goodWhenUp;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isGood ? "text-status-good" : "text-status-critical",
      )}
    >
      {d.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {d.value}
    </span>
  );
}

export default function HeroBalance({
  summary,
  previousSummary,
  currency,
  goal,
}: HeroBalanceProps) {
  const balanceDelta = previousSummary ? delta(summary.balance, previousSummary.balance) : null;
  const incomeDelta = previousSummary
    ? delta(summary.totalIncome, previousSummary.totalIncome)
    : null;
  const expensesDelta = previousSummary
    ? delta(summary.totalExpenses, previousSummary.totalExpenses, false)
    : null;

  const progress = goal && goal > 0 ? Math.max(0, Math.min(1, summary.balance / goal)) : null;
  const goalReached = goal !== null && summary.balance >= goal;

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary-light dark:text-ink-secondary-dark">
        Saldo do mês
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p
          className={clsx(
            "text-4xl font-bold tracking-tight sm:text-5xl",
            summary.balance >= 0
              ? "text-ink-primary-light dark:text-ink-primary-dark"
              : "text-status-critical",
          )}
        >
          {formatCurrency(summary.balance, currency)}
        </p>
        {balanceDelta && (
          <span className="flex items-center gap-1 text-sm">
            <DeltaTag d={balanceDelta} />
            <span className="text-xs text-ink-muted">vs. mês anterior</span>
          </span>
        )}
      </div>

      {progress !== null && goal !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
            <span>Meta de economia: {formatCurrency(goal, currency)}</span>
            <span
              className={goalReached ? "font-medium text-status-good" : "font-medium text-series-1"}
            >
              {formatPercent(progress)}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-series-1/15">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: goalReached ? "var(--status-good)" : "var(--series-1)",
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-black/5 dark:border-white/10 pt-4">
        <div>
          <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark">Receitas</p>
          <p className="mt-0.5 text-lg font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            {formatCurrency(summary.totalIncome, currency)}
          </p>
          {incomeDelta && <DeltaTag d={incomeDelta} />}
        </div>
        <div>
          <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark">Despesas</p>
          <p className="mt-0.5 text-lg font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            {formatCurrency(summary.totalExpenses, currency)}
          </p>
          {expensesDelta && <DeltaTag d={expensesDelta} />}
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
            Taxa de poupança
            <HelpTip text="Percentual da renda que permaneceu após as despesas do mês." />
          </p>
          <p
            className={clsx(
              "mt-0.5 text-lg font-semibold",
              summary.savingsRate >= 0 ? "text-status-good" : "text-status-critical",
            )}
          >
            {formatPercent(summary.savingsRate)}
          </p>
        </div>
      </div>
    </Card>
  );
}
