import type {
  ExpenseCategory,
  FixedExpense,
  IncomeCategory,
  IncomeSource,
  VariableExpense,
} from "../types";
import { dateIsInMonth, lastNMonthKeys, rangeCoversMonth } from "./date";

export interface MonthSummary {
  monthKey: string;
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number; // 0..1 (pode ser negativo)
}

export function activeIncomeForMonth(sources: IncomeSource[], monthK: string): IncomeSource[] {
  return sources.filter((s) => s.active && rangeCoversMonth(s.startDate, s.endDate, monthK));
}

export function activeFixedExpensesForMonth(
  expenses: FixedExpense[],
  monthK: string,
): FixedExpense[] {
  return expenses.filter((e) => e.active && rangeCoversMonth(e.startDate, e.endDate, monthK));
}

export function variableExpensesForMonth(
  expenses: VariableExpense[],
  monthK: string,
): VariableExpense[] {
  return expenses.filter((e) => dateIsInMonth(e.date, monthK));
}

export function summarizeMonth(
  incomeSources: IncomeSource[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  monthK: string,
): MonthSummary {
  const totalIncome = sum(activeIncomeForMonth(incomeSources, monthK).map((s) => s.amount));
  const totalFixedExpenses = sum(
    activeFixedExpensesForMonth(fixedExpenses, monthK).map((e) => e.amount),
  );
  const totalVariableExpenses = sum(
    variableExpensesForMonth(variableExpenses, monthK).map((e) => e.amount),
  );
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? balance / totalIncome : 0;

  return {
    monthKey: monthK,
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    balance,
    savingsRate,
  };
}

export function summarizeLastNMonths(
  incomeSources: IncomeSource[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  reference: Date,
  n: number,
): MonthSummary[] {
  return lastNMonthKeys(reference, n).map((mk) =>
    summarizeMonth(incomeSources, fixedExpenses, variableExpenses, mk),
  );
}

export interface CategoryTotal<C extends string> {
  category: C;
  total: number;
}

export function expensesByCategory(
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  monthK: string,
): CategoryTotal<ExpenseCategory>[] {
  const totals = new Map<ExpenseCategory, number>();

  for (const e of activeFixedExpensesForMonth(fixedExpenses, monthK)) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  for (const e of variableExpensesForMonth(variableExpenses, monthK)) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function incomeByCategory(
  incomeSources: IncomeSource[],
  monthK: string,
): CategoryTotal<IncomeCategory>[] {
  const totals = new Map<IncomeCategory, number>();
  for (const s of activeIncomeForMonth(incomeSources, monthK)) {
    totals.set(s.category, (totals.get(s.category) ?? 0) + s.amount);
  }
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export type ActivityItem =
  | {
      id: string;
      kind: "income";
      name: string;
      category: IncomeCategory;
      date: string;
      amount: number;
    }
  | {
      id: string;
      kind: "expense";
      name: string;
      category: ExpenseCategory;
      date: string;
      amount: number;
    };

/**
 * "Atividade recente" do mês, a partir do único dado com data pontual real (despesa variável)
 * mais receitas/despesas fixas cujo início de vigência caiu dentro do mês — não existe um log de
 * transações no modelo de dados, então isso é o mais próximo de um extrato sem inventar histórico.
 */
export function recentActivityForMonth(
  incomeSources: IncomeSource[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  monthK: string,
  limit = 8,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const s of incomeSources) {
    if (s.active && dateIsInMonth(s.startDate, monthK)) {
      items.push({
        id: s.id,
        kind: "income",
        name: s.name,
        category: s.category,
        date: s.startDate,
        amount: s.amount,
      });
    }
  }
  for (const e of fixedExpenses) {
    if (e.active && dateIsInMonth(e.startDate, monthK)) {
      items.push({
        id: e.id,
        kind: "expense",
        name: e.name,
        category: e.category,
        date: e.startDate,
        amount: e.amount,
      });
    }
  }
  for (const e of variableExpensesForMonth(variableExpenses, monthK)) {
    items.push({
      id: e.id,
      kind: "expense",
      name: e.name,
      category: e.category,
      date: e.date,
      amount: e.amount,
    });
  }

  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

/** Agrupa itens além do top N em "Outros", para manter rankings legíveis. */
export function topWithOther<C extends string>(
  totals: CategoryTotal<C>[],
  labels: Record<C, string>,
  topN = 5,
): { label: string; value: number }[] {
  const sorted = [...totals].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, topN).map((t) => ({ label: labels[t.category], value: t.total }));
  const rest = sorted.slice(topN);
  const restTotal = sum(rest.map((t) => t.total));
  if (restTotal > 0) {
    top.push({ label: "Outros", value: restTotal });
  }
  return top;
}
