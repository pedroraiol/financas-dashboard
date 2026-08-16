import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyCompact } from "../../utils/currency";
import { useFinanceStore } from "../../store/useFinanceStore";
import ChartTooltip from "./ChartTooltip";

interface RankingItem {
  label: string;
  value: number;
}

export default function CategoryRankingChart({
  items,
  color,
  seriesName,
}: {
  items: RankingItem[];
  color: string;
  seriesName: string;
}) {
  const currency = useFinanceStore((s) => s.settings.currency);
  const data = items.map((i) => ({ name: i.label, [seriesName]: i.value }));
  const height = Math.max(items.length * 36 + 24, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrencyCompact(v, currency)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--chart-text-muted)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fill: "var(--chart-text-secondary)", fontSize: 12 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--chart-grid)", opacity: 0.4 }} />
        <Bar dataKey={seriesName} radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((_, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
