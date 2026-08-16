import { useState } from "react";
import { Moon, Sun, Monitor, UserRound, Lock } from "lucide-react";
import { useFinanceStore } from "../../store/useFinanceStore";
import type { AppSettings } from "../../types";
import ProfileSwitcherModal from "../profile/ProfileSwitcherModal";

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
  const profiles = useFinanceStore((s) => s.profiles);
  const activeProfileId = useFinanceStore((s) => s.activeProfileId);
  const lockActiveProfile = useFinanceStore((s) => s.lockActiveProfile);
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const Icon = THEME_ICON[theme];

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    updateSettings({ theme: next });
  };

  return (
    <header className="flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-surface-light/80 dark:bg-surface-dark/80 px-5 py-4 backdrop-blur">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSwitcherOpen(true)}
          title="Perfis"
          className="flex items-center gap-1.5 rounded-full border border-ink-muted/30 py-1.5 pl-2.5 pr-3 text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
        >
          <UserRound size={14} />
          <span className="max-w-[100px] truncate">{activeProfile?.name}</span>
        </button>
        {activeProfile?.hasPin && (
          <button
            onClick={lockActiveProfile}
            title="Bloquear perfil agora"
            aria-label="Bloquear perfil agora"
            className="rounded-full p-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Lock size={16} />
          </button>
        )}
        <button
          onClick={cycleTheme}
          title={THEME_LABEL[theme]}
          aria-label={THEME_LABEL[theme]}
          className="rounded-full p-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon size={18} />
        </button>
      </div>

      {switcherOpen && <ProfileSwitcherModal onClose={() => setSwitcherOpen(false)} />}
    </header>
  );
}
