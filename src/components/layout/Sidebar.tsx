import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, Receipt, Settings, PiggyBank } from "lucide-react";
import clsx from "../../utils/clsx";

const NAV_GROUPS = [
  {
    label: "Visão geral",
    items: [{ to: "/", label: "Painel", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Movimentações",
    items: [
      { to: "/receitas", label: "Receitas", icon: Wallet, end: false },
      { to: "/despesas", label: "Despesas", icon: Receipt, end: false },
    ],
  },
  {
    label: "Sistema",
    items: [{ to: "/configuracoes", label: "Configurações", icon: Settings, end: false }],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export default function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-black/5 dark:md:border-white/10 md:bg-surface-light dark:md:bg-surface-dark md:px-4 md:py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="rounded-lg bg-series-1 p-1.5 text-white">
            <PiggyBank size={18} />
          </div>
          <span className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Meu Painel Financeiro
          </span>
        </div>
        <nav className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {group.label}
              </span>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-series-1/10 text-series-1"
                        : "text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/5",
                    )
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                isActive
                  ? "text-series-1"
                  : "text-ink-secondary-light dark:text-ink-secondary-dark",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
