import type { SelectHTMLAttributes } from "react";
import clsx from "../../utils/clsx";
import HelpTip from "./HelpTip";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  help?: string;
}

export default function Select({ label, options, help, className, id, ...rest }: SelectProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark"
      >
        {label}
        {help && <HelpTip text={help} />}
      </label>
      <select
        id={selectId}
        className={clsx(
          "rounded-lg border border-ink-muted/40 bg-surface-light dark:bg-surface-dark px-3 py-2.5 text-sm outline-none transition-colors",
          "focus:border-series-1 focus:ring-2 focus:ring-series-1/20",
          className,
        )}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
