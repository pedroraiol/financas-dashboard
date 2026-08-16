import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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

export default function BalanceTrendChart({ data }: { data: MonthSummary[] }) {
  const currency = useFinanceStore((s) => s.settings.currency);

  const chartData = data.map((m) => ({ month: m.monthKey, Saldo: m.balance }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <ReferenceLine y={0} stroke="var(--chart-baseline)" />
        <Tooltip content={<ChartTooltip labelFormatter={formatMonthLong} />} />
        <Line
          type="monotone"
          dataKey="Saldo"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--series-1)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
          activeDot={{ r: 5, stroke: "var(--chart-surface)", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
