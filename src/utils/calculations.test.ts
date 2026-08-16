import { describe, expect, it } from "vitest";
import { EXPENSE_CATEGORY_LABELS } from "../types";
import type { FixedExpense, IncomeSource, VariableExpense } from "../types";
import {
  expensesByCategory,
  incomeByCategory,
  recentActivityForMonth,
  summarizeLastNMonths,
  summarizeMonth,
  topWithOther,
} from "./calculations";

function income(overrides: Partial<IncomeSource> = {}): IncomeSource {
  return {
    id: "i1",
    name: "Salário",
    amount: 5000,
    category: "salario",
    startDate: "2026-01-01",
    endDate: null,
    active: true,
    ...overrides,
  };
}

function fixedExpense(overrides: Partial<FixedExpense> = {}): FixedExpense {
  return {
    id: "f1",
    name: "Aluguel",
    amount: 1500,
    category: "moradia",
    startDate: "2026-01-01",
    endDate: null,
    active: true,
    ...overrides,
  };
}

function variableExpense(overrides: Partial<VariableExpense> = {}): VariableExpense {
  return {
    id: "v1",
    name: "Mercado",
    amount: 300,
    category: "alimentacao",
    date: "2026-03-10",
    ...overrides,
  };
}

describe("summarizeMonth", () => {
  it("sums income and expenses and computes balance and savings rate", () => {
    const summary = summarizeMonth(
      [income({ amount: 5000 })],
      [fixedExpense({ amount: 1500 })],
      [variableExpense({ amount: 500 })],
      "2026-03",
    );

    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalFixedExpenses).toBe(1500);
    expect(summary.totalVariableExpenses).toBe(500);
    expect(summary.totalExpenses).toBe(2000);
    expect(summary.balance).toBe(3000);
    expect(summary.savingsRate).toBeCloseTo(0.6);
  });

  it("ignores inactive income and expired ranges", () => {
    const summary = summarizeMonth(
      [income({ active: false })],
      [fixedExpense({ endDate: "2026-01-31" })],
      [],
      "2026-03",
    );

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalFixedExpenses).toBe(0);
  });

  it("returns a savings rate of 0 when there is no income", () => {
    const summary = summarizeMonth([], [fixedExpense()], [], "2026-03");
    expect(summary.savingsRate).toBe(0);
    expect(summary.balance).toBe(-1500);
  });

  it("allows a negative savings rate when expenses exceed income", () => {
    const summary = summarizeMonth(
      [income({ amount: 1000 })],
      [fixedExpense({ amount: 1500 })],
      [],
      "2026-03",
    );
    expect(summary.balance).toBe(-500);
    expect(summary.savingsRate).toBeCloseTo(-0.5);
  });
});

describe("summarizeLastNMonths", () => {
  it("returns one summary per month, oldest first", () => {
    const history = summarizeLastNMonths(
      [income({ amount: 1000 })],
      [],
      [],
      new Date(2026, 2, 1),
      3,
    );
    expect(history.map((h) => h.monthKey)).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(history.every((h) => h.totalIncome === 1000)).toBe(true);
  });
});

describe("expensesByCategory", () => {
  it("groups fixed and variable expenses together by category, sorted descending", () => {
    const totals = expensesByCategory(
      [fixedExpense({ category: "moradia", amount: 1500 })],
      [
        variableExpense({ category: "alimentacao", amount: 900 }),
        variableExpense({ category: "moradia", amount: 100 }),
      ],
      "2026-03",
    );

    expect(totals).toEqual([
      { category: "moradia", total: 1600 },
      { category: "alimentacao", total: 900 },
    ]);
  });
});

describe("incomeByCategory", () => {
  it("sums only active income within range for the given month", () => {
    const totals = incomeByCategory(
      [
        income({ category: "salario", amount: 5000 }),
        income({ category: "freelance", active: false }),
      ],
      "2026-03",
    );
    expect(totals).toEqual([{ category: "salario", total: 5000 }]);
  });
});

describe("topWithOther", () => {
  it("keeps the top N and buckets the rest into Outros", () => {
    const result = topWithOther(
      [
        { category: "moradia", total: 500 },
        { category: "alimentacao", total: 400 },
        { category: "transporte", total: 300 },
        { category: "saude", total: 200 },
        { category: "educacao", total: 100 },
        { category: "lazer", total: 50 },
      ],
      EXPENSE_CATEGORY_LABELS,
      5,
    );

    expect(result).toEqual([
      { label: "Moradia", value: 500 },
      { label: "Alimentação", value: 400 },
      { label: "Transporte", value: 300 },
      { label: "Saúde", value: 200 },
      { label: "Educação", value: 100 },
      { label: "Outros", value: 50 },
    ]);
  });

  it("omits the Outros bucket when everything fits in the top N", () => {
    const result = topWithOther(
      [{ category: "moradia", total: 500 }],
      { moradia: "Moradia" } as Record<string, string>,
      5,
    );
    expect(result).toEqual([{ label: "Moradia", value: 500 }]);
  });
});

describe("recentActivityForMonth", () => {
  it("includes variable expenses dated in the month and sorts by date desc", () => {
    const items = recentActivityForMonth(
      [],
      [],
      [
        variableExpense({ id: "v1", date: "2026-03-05", amount: 50 }),
        variableExpense({ id: "v2", date: "2026-03-20", amount: 80 }),
      ],
      "2026-03",
    );
    expect(items.map((i) => i.id)).toEqual(["v2", "v1"]);
  });

  it("excludes variable expenses from other months", () => {
    const items = recentActivityForMonth(
      [],
      [],
      [variableExpense({ date: "2026-02-20" })],
      "2026-03",
    );
    expect(items).toEqual([]);
  });

  it("includes income and fixed expenses whose start date falls in the month", () => {
    const items = recentActivityForMonth(
      [income({ id: "i1", startDate: "2026-03-01" })],
      [fixedExpense({ id: "f1", startDate: "2026-03-10" })],
      [],
      "2026-03",
    );
    expect(items.map((i) => ({ id: i.id, kind: i.kind }))).toEqual(
      expect.arrayContaining([
        { id: "i1", kind: "income" },
        { id: "f1", kind: "expense" },
      ]),
    );
  });

  it("ignores inactive income/fixed expenses and respects the item limit", () => {
    const variable = Array.from({ length: 10 }, (_, i) =>
      variableExpense({ id: `v${i}`, date: `2026-03-${String(i + 1).padStart(2, "0")}` }),
    );
    const items = recentActivityForMonth(
      [income({ id: "i1", startDate: "2026-03-01", active: false })],
      [],
      variable,
      "2026-03",
      8,
    );
    expect(items).toHaveLength(8);
    expect(items.some((i) => i.id === "i1")).toBe(false);
  });
});
