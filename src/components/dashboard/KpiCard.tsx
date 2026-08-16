import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import clsx from "../../utils/clsx";
import HelpTip from "../ui/HelpTip";

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconTone?: "series-1" | "series-2" | "good" | "critical" | "neutral";
  delta?: { value: string; positive: boolean; goodWhenUp?: boolean } | null;
  help?: string;
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps["iconTone"]>, string> = {
  "series-1": "bg-series-1/10 text-series-1",
  "series-2": "bg-series-2/10 text-series-2",
  good: "bg-status-good/10 text-status-good",
  critical: "bg-status-critical/10 text-status-critical",
  neutral: "bg-black/5 dark:bg-white/10 text-ink-secondary-light dark:text-ink-secondary-dark",
};

export default function KpiCard({
  label,
  value,
  icon,
  iconTone = "neutral",
  delta,
  help,
}: KpiCardProps) {
  const deltaIsGood = delta ? delta.positive === (delta.goodWhenUp ?? true) : true;

  return (
    <div className="rounded-card border border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          {label}
          {help && <HelpTip text={help} />}
        </div>
        <div className={clsx("rounded-full p-2", TONE_CLASSES[iconTone])}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
        {value}
      </p>
      {delta && (
        <div
          className={clsx(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            deltaIsGood ? "text-status-good" : "text-status-critical",
          )}
        >
          {delta.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta.value}
          <span className="font-normal text-ink-muted">vs. mês anterior</span>
        </div>
      )}
    </div>
  );
}
