import { Moon, Sun, Monitor } from "lucide-react";
import { useFinanceStore } from "../../store/useFinanceStore";
import type { AppSettings } from "../../types";

const THEME_CYCLE: AppSettings["theme"][] = ["system", "light", "dark"];
const THEME_ICON: Record<AppSettings["theme"], typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};
const THEME_LABEL: Record<AppSettings["theme"], string> = {
  system: "Tema: automático",
  light: "Tema: claro",
  dark: "Tema: escuro",
};

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useFinanceStore((s) => s.settings.theme);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const Icon = THEME_ICON[theme];

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    updateSettings({ theme: next });
  };

  return (
    <header className="flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-surface-light/80 dark:bg-surface-dark/80 px-5 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-secondary-light dark:text-ink-secondary-dark">{subtitle}</p>
        )}
      </div>
      <button
        onClick={cycleTheme}
        title={THEME_LABEL[theme]}
        aria-label={THEME_LABEL[theme]}
        className="rounded-full p-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Icon size={18} />
      </button>
    </header>
  );
}
