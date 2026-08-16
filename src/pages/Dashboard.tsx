import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Wallet, Receipt, Scale, PiggyBank, Sparkles } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import KpiCard from "../components/dashboard/KpiCard";
import MonthSelector from "../components/dashboard/MonthSelector";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";
import BalanceTrendChart from "../components/dashboard/BalanceTrendChart";
import CategoryRankingChart from "../components/dashboard/CategoryRankingChart";
import FixedVariableDonut from "../components/dashboard/FixedVariableDonut";
import SavingsGoalCard from "../components/dashboard/SavingsGoalCard";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { useFinanceStore } from "../store/useFinanceStore";
import { useMonthSelector } from "../hooks/useMonthSelector";
import {
  expensesByCategory,
  incomeByCategory,
  summarizeLastNMonths,
  summarizeMonth,
  topWithOther,
} from "../utils/calculations";
import { formatCurrency, formatPercent } from "../utils/currency";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "../types";

export default function Dashboard() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const fixedExpenses = useFinanceStore((s) => s.fixedExpenses);
  const variableExpenses = useFinanceStore((s) => s.variableExpenses);
  const currency = useFinanceStore((s) => s.settings.currency);
  const savingsGoal = useFinanceStore((s) => s.settings.monthlySavingsGoal);

  const { selectedMonth, goToPrevious, goToNext } = useMonthSelector();

  const hasAnyData = incomeSources.length > 0 || fixedExpenses.length > 0 || variableExpenses.length > 0;

  const summary = useMemo(
    () => summarizeMonth(incomeSources, fixedExpenses, variableExpenses, selectedMonth),
    [incomeSources, fixedExpenses, variableExpenses, selectedMonth],
  );

  const previousSummary = useMemo(() => {
    const history = summarizeLastNMonths(incomeSources, fixedExpenses, variableExpenses, new Date(`${selectedMonth}-01T00:00:00`), 2);
    return history[0];
  }, [incomeSources, fixedExpenses, variableExpenses, selectedMonth]);

  const history = useMemo(
    () => summarizeLastNMonths(incomeSources, fixedExpenses, variableExpenses, new Date(`${selectedMonth}-01T00:00:00`), 6),
    [incomeSources, fixedExpenses, variableExpenses, selectedMonth],
  );

  const expenseCategoryData = useMemo(
    () => topWithOther(expensesByCategory(fixedExpenses, variableExpenses, selectedMonth), EXPENSE_CATEGORY_LABELS),
    [fixedExpenses, variableExpenses, selectedMonth],
  );

  const incomeCategoryData = useMemo(
    () => topWithOther(incomeByCategory(incomeSources, selectedMonth), INCOME_CATEGORY_LABELS),
    [incomeSources, selectedMonth],
  );

  const delta = (current: number, previous: number, goodWhenUp = true) => {
    if (previous === 0) return null;
    const pct = (current - previous) / Math.abs(previous);
    return { value: formatPercent(Math.abs(pct)), positive: pct >= 0, goodWhenUp };
  };

  if (!hasAnyData) {
    return (
      <>
        <Header title="Painel" subtitle="Sua visão geral financeira" />
        <div className="mt-6">
          <EmptyState
            icon={<Sparkles size={22} />}
            title="Vamos começar!"
            description="Cadastre suas fontes de renda e despesas para ver seu painel financeiro ganhar vida, com gráficos e indicadores automáticos."
            action={
              <div className="mt-2 flex gap-2">
                <Link to="/receitas">
                  <Button>Cadastrar receita</Button>
                </Link>
                <Link to="/despesas">
                  <Button variant="secondary">Cadastrar despesa</Button>
                </Link>
              </div>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Painel" subtitle="Sua visão geral financeira" />

      <div className="mt-5 flex justify-end">
        <MonthSelector monthKey={selectedMonth} onPrevious={goToPrevious} onNext={goToNext} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Receitas do mês"
          value={formatCurrency(summary.totalIncome, currency)}
          icon={<Wallet size={16} />}
          iconTone="series-1"
          delta={previousSummary ? delta(summary.totalIncome, previousSummary.totalIncome) : null}
          help="Soma de todas as suas fontes de renda ativas neste mês."
        />
        <KpiCard
          label="Despesas do mês"
          value={formatCurrency(summary.totalExpenses, currency)}
          icon={<Receipt size={16} />}
          iconTone="series-2"
          delta={previousSummary ? delta(summary.totalExpenses, previousSummary.totalExpenses, false) : null}
          help="Soma das despesas fixas e variáveis deste mês. Para despesas, uma alta é ruim, por isso a seta inverte a cor."
        />
        <KpiCard
          label="Saldo do mês"
          value={formatCurrency(summary.balance, currency)}
          icon={<Scale size={16} />}
          iconTone={summary.balance >= 0 ? "good" : "critical"}
          delta={previousSummary ? delta(summary.balance, previousSummary.balance) : null}
          help="Receitas menos despesas. Positivo significa que sobrou dinheiro no mês."
        />
        <KpiCard
          label="Taxa de poupança"
          value={formatPercent(summary.savingsRate)}
          icon={<PiggyBank size={16} />}
          iconTone={summary.savingsRate >= 0 ? "good" : "critical"}
          help="Percentual da renda que sobrou (ou faltou) no mês. Especialistas recomendam poupar pelo menos 20%."
        />
      </div>

      {savingsGoal && savingsGoal > 0 && (
        <div className="mt-4">
          <SavingsGoalCard balance={summary.balance} goal={savingsGoal} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Receitas x Despesas" subtitle="Últimos 6 meses">
          <IncomeExpenseChart data={history} />
        </Card>
        <Card title="Evolução do saldo" subtitle="Últimos 6 meses">
          <BalanceTrendChart data={history} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          title="Despesas por categoria"
          subtitle="Mês selecionado"
          className="xl:col-span-2"
        >
          {expenseCategoryData.length > 0 ? (
            <CategoryRankingChart items={expenseCategoryData} color="var(--series-2)" seriesName="Despesas" />
          ) : (
            <p className="py-8 text-center text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
              Nenhuma despesa cadastrada neste mês.
            </p>
          )}
        </Card>
        <Card title="Fixas x Variáveis" subtitle="Despesas do mês">
          <FixedVariableDonut fixed={summary.totalFixedExpenses} variable={summary.totalVariableExpenses} />
        </Card>
      </div>

      {incomeCategoryData.length > 1 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Card title="Fontes de renda" subtitle="Mês selecionado">
            <CategoryRankingChart items={incomeCategoryData} color="var(--series-1)" seriesName="Receitas" />
          </Card>
        </div>
      )}
    </>
  );
}
