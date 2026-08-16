import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-muted/30 px-6 py-12 text-center">
      <div className="rounded-full bg-series-1/10 p-3 text-series-1">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          {title}
        </h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
