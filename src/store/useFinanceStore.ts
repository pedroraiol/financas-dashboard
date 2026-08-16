import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  FixedExpense,
  IncomeSource,
  VariableExpense,
} from "../types";

interface FinanceState {
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;

  addIncomeSource: (item: Omit<IncomeSource, "id">) => void;
  updateIncomeSource: (id: string, item: Omit<IncomeSource, "id">) => void;
  removeIncomeSource: (id: string) => void;

  addFixedExpense: (item: Omit<FixedExpense, "id">) => void;
  updateFixedExpense: (id: string, item: Omit<FixedExpense, "id">) => void;
  removeFixedExpense: (id: string) => void;

  addVariableExpense: (item: Omit<VariableExpense, "id">) => void;
  updateVariableExpense: (id: string, item: Omit<VariableExpense, "id">) => void;
  removeVariableExpense: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  importData: (data: {
    incomeSources: IncomeSource[];
    fixedExpenses: FixedExpense[];
    variableExpenses: VariableExpense[];
    settings: AppSettings;
  }) => void;
  resetAll: () => void;
}

const defaultSettings: AppSettings = {
  currency: "BRL",
  theme: "system",
  monthlySavingsGoal: null,
  onboardingComplete: false,
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      incomeSources: [],
      fixedExpenses: [],
      variableExpenses: [],
      settings: defaultSettings,

      addIncomeSource: (item) =>
        set((state) => ({
          incomeSources: [...state.incomeSources, { ...item, id: makeId() }],
        })),
      updateIncomeSource: (id, item) =>
        set((state) => ({
          incomeSources: state.incomeSources.map((i) =>
            i.id === id ? { ...item, id } : i,
          ),
        })),
      removeIncomeSource: (id) =>
        set((state) => ({
          incomeSources: state.incomeSources.filter((i) => i.id !== id),
        })),

      addFixedExpense: (item) =>
        set((state) => ({
          fixedExpenses: [...state.fixedExpenses, { ...item, id: makeId() }],
        })),
      updateFixedExpense: (id, item) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((i) =>
            i.id === id ? { ...item, id } : i,
          ),
        })),
      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((i) => i.id !== id),
        })),

      addVariableExpense: (item) =>
        set((state) => ({
          variableExpenses: [
            ...state.variableExpenses,
            { ...item, id: makeId() },
          ],
        })),
      updateVariableExpense: (id, item) =>
        set((state) => ({
          variableExpenses: state.variableExpenses.map((i) =>
            i.id === id ? { ...item, id } : i,
          ),
        })),
      removeVariableExpense: (id) =>
        set((state) => ({
          variableExpenses: state.variableExpenses.filter((i) => i.id !== id),
        })),

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      importData: (data) =>
        set({
          incomeSources: data.incomeSources,
          fixedExpenses: data.fixedExpenses,
          variableExpenses: data.variableExpenses,
          settings: data.settings,
        }),

      resetAll: () =>
        set({
          incomeSources: [],
          fixedExpenses: [],
          variableExpenses: [],
          settings: defaultSettings,
        }),
    }),
    {
      name: "financas-dashboard-data",
      version: 1,
    },
  ),
);
