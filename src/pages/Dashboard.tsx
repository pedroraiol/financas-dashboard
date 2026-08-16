import { useMemo } from "react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import HeroBalance from "../components/dashboard/HeroBalance";
import MonthSelector from "../components/dashboard/MonthSelector";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";
import BalanceTrendChart from "../components/dashboard/BalanceTrendChart";
import CategoryRankingChart from "../components/dashboard/CategoryRankingChart";
import FixedVariableDonut from "../components/dashboard/FixedVariableDonut";
import RecentActivity from "../components/dashboard/RecentActivity";
import OnboardingChecklist from "../components/dashboard/OnboardingChecklist";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useFinanceStore } from "../store/useFinanceStore";
import { useMonthSelector } from "../hooks/useMonthSelector";
import {
  expensesByCategory,
  incomeByCategory,
  recentActivityForMonth,
  summarizeLastNMonths,
  summarizeMonth,
  topWithOther,
} from "../utils/calculations";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "../types";

export default function Dashboard() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const fixedExpenses = useFinanceStore((s) => s.fixedExpenses);
  const variableExpenses = useFinanceStore((s) => s.variableExpenses);
  const currency = useFinanceStore((s) => s.settings.currency);
  const savingsGoal = useFinanceStore((s) => s.settings.monthlySavingsGoal);
  const onboardingComplete = useFinanceStore((s) => s.settings.onboardingComplete);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const { selectedMonth, goToPrevious, goToNext, goToMonth } = useMonthSelector();

  const hasAnyData =
    incomeSources.length > 0 || fixedExpenses.length > 0 || variableExpenses.length > 0;

  const summary = useMemo(
    () => summarizeMonth(incomeSources, fixedExpenses, variableExpenses, selectedMonth),
    [incomeSources, fixedExpenses, variableExpenses, selectedMonth],
  );

  const previousSummary = useMemo(() => {
    const history = summarizeLastNMonths(
      incomeSources,
      fixedExpenses,
      variableExpenses,
      new Date(`${selectedMonth}-01T00:00:00`),
      2,
    );
    return history[0];
  }, [incomeSources, fixedExpenses, variableExpenses, selectedMonth]);

  const history = useMemo(
    () =>
      summarizeLastNMonths(
        incomeSources,
        fixedExpenses,
        variableExpenses,
        new Date(`${selectedMonth}-01T00:00:00`),
        6,
      ),
    [incomeSources, fixedExpenses, variableExpenses, selectedMonth],
  );

  const expenseCategoryData = useMemo(
    () =>
      topWithOther(
        expensesByCategory(fixedExpenses, variableExpenses, selectedMonth),
        EXPENSE_CATEGORY_LABELS,
      ),
    [fixedExpenses, variableExpenses, selectedMonth],
  );

  const incomeCategoryData = useMemo(
    () => topWithOther(incomeByCategory(incomeSources, selectedMonth), INCOME_CATEGORY_LABELS),
    [incomeSources, selectedMonth],
  );

  const activity = useMemo(
    () => recentActivityForMonth(incomeSources, fixedExpenses, variableExpenses, selectedMonth),
    [incomeSources, fixedExpenses, variableExpenses, selectedMonth],
  );

  if (!hasAnyData) {
    return (
      <>
        <Header title="Painel" subtitle="Sua visão geral financeira" />
        <div className="mt-6">
          {onboardingComplete ? (
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
          ) : (
            <OnboardingChecklist
              hasIncome={incomeSources.length > 0}
              hasExpense={fixedExpenses.length + variableExpenses.length > 0}
              hasGoal={savingsGoal != null}
              onSkip={() => updateSettings({ onboardingComplete: true })}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Painel" subtitle="Sua visão geral financeira" />

      <div className="mt-4 flex justify-start">
        <MonthSelector
          monthKey={selectedMonth}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSelectMonth={goToMonth}
        />
      </div>

      <div className="mt-3">
        <HeroBalance
          summary={summary}
          previousSummary={previousSummary}
          currency={currency}
          goal={savingsGoal && savingsGoal > 0 ? savingsGoal : null}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Receitas x Despesas" subtitle="Últimos 6 meses">
          <IncomeExpenseChart data={history} />
        </Card>
        <Card title="Evolução do saldo" subtitle="Últimos 6 meses">
          <BalanceTrendChart data={history} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Despesas por categoria" subtitle="Mês selecionado" className="xl:col-span-2">
          {expenseCategoryData.length > 0 ? (
            <CategoryRankingChart
              items={expenseCategoryData}
              color="var(--series-2)"
              seriesName="Despesas"
            />
          ) : (
            <p className="py-8 text-center text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
              Nenhuma despesa cadastrada neste mês.
            </p>
          )}
        </Card>
        <Card title="Fixas x Variáveis" subtitle="Despesas do mês">
          <FixedVariableDonut
            fixed={summary.totalFixedExpenses}
            variable={summary.totalVariableExpenses}
          />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity items={activity} currency={currency} />
        </div>
        {incomeCategoryData.length > 1 && (
          <Card title="Fontes de renda" subtitle="Mês selecionado">
            <CategoryRankingChart
              items={incomeCategoryData}
              color="var(--series-1)"
              seriesName="Receitas"
            />
          </Card>
        )}
      </div>
    </>
  );
}
