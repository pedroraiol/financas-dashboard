import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthSummary } from "../../utils/calculations";
import { formatCurrencyCompact } from "../../utils/currency";
import { formatMonthLabel, formatMonthLong } from "../../utils/date";
import { useFinanceStore } from "../../store/useFinanceStore";
import ChartTooltip from "./ChartTooltip";

export default function IncomeExpenseChart({ data }: { data: MonthSummary[] }) {
  const currency = useFinanceStore((s) => s.settings.currency);

  const chartData = data.map((m) => ({
    month: m.monthKey,
    Receitas: m.totalIncome,
    Despesas: m.totalExpenses,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} barGap={2} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-baseline)" }}
          tick={{ fill: "var(--chart-text-muted)", fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrencyCompact(v, currency)}
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fill: "var(--chart-text-muted)", fontSize: 12 }}
        />
        <Tooltip
          content={<ChartTooltip labelFormatter={formatMonthLong} />}
          cursor={{ fill: "var(--chart-grid)", opacity: 0.4 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--chart-text-secondary)" }}
        />
        <Bar dataKey="Receitas" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Despesas" fill="var(--series-2)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
