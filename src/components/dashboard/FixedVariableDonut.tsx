import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { useFinanceStore } from "../../store/useFinanceStore";
import ChartTooltip from "./ChartTooltip";

export default function FixedVariableDonut({
  fixed,
  variable,
}: {
  fixed: number;
  variable: number;
}) {
  const currency = useFinanceStore((s) => s.settings.currency);
  const total = fixed + variable;

  const data = [
    { name: "Fixas", value: fixed, color: "var(--series-2)" },
    { name: "Variáveis", value: variable, color: "var(--series-3)" },
  ];

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
        Sem despesas neste mês.
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            stroke="var(--chart-surface)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--chart-text-secondary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
        <span className="text-[11px] text-ink-muted">Total</span>
        <span className="text-sm font-semibold tabular text-ink-primary-light dark:text-ink-primary-dark">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
