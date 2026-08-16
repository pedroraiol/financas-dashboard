import type { ReactNode } from "react";
import clsx from "../../utils/clsx";

type Tone = "neutral" | "good" | "critical" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-black/5 dark:bg-white/10 text-ink-secondary-light dark:text-ink-secondary-dark",
  good: "bg-status-good/10 text-status-good",
  critical: "bg-status-critical/10 text-status-critical",
  info: "bg-series-1/10 text-series-1",
};

export default function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
