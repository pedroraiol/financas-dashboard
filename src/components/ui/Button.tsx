import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "../../utils/clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-series-1 text-white hover:bg-[#1c5cab] focus-visible:ring-series-1 border border-transparent",
  secondary:
    "bg-transparent text-ink-primary-light dark:text-ink-primary-dark border border-ink-muted/40 hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-series-1",
  ghost:
    "bg-transparent text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 border border-transparent",
  danger:
    "bg-transparent text-status-critical border border-status-critical/40 hover:bg-status-critical/10 focus-visible:ring-status-critical",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-light dark:focus-visible:ring-offset-surface-dark",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
