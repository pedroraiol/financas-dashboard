import type { InputHTMLAttributes } from "react";
import clsx from "../../utils/clsx";
import HelpTip from "./HelpTip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  help?: string;
  error?: string;
}

export default function Input({ label, help, error, className, id, ...rest }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
        {label}
        {help && <HelpTip text={help} />}
      </label>
      <input
        id={inputId}
        className={clsx(
          "rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors",
          "border-ink-muted/40 focus:border-series-1 focus:ring-2 focus:ring-series-1/20",
          error && "border-status-critical focus:border-status-critical focus:ring-status-critical/20",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-status-critical">
          {error}
        </p>
      )}
    </div>
  );
}
