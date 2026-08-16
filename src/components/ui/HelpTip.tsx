import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-ink-muted hover:text-series-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-series-1/40 rounded-full"
        aria-label="Ajuda"
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-2.5 text-xs font-normal leading-relaxed text-ink-secondary-light dark:text-ink-secondary-dark shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
