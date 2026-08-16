import type { ReactNode } from "react";
import clsx from "../../utils/clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-card border border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 shadow-sm",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
