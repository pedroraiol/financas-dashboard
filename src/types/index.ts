// Modelo de dados do painel financeiro.
// Tudo é persistido no localStorage do navegador (ver src/store/useFinanceStore.ts).

export type IncomeCategory =
  "salario" | "freelance" | "investimentos" | "beneficios" | "aluguel_recebido" | "outro";

export type ExpenseCategory =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "saude"
  | "educacao"
  | "lazer"
  | "assinaturas"
  | "vestuario"
  | "dividas"
  | "outros";

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  category: IncomeCategory;
  /** Data (YYYY-MM-DD) a partir da qual essa renda passa a valer. */
  startDate: string;
  /** Data (YYYY-MM-DD) em que essa renda deixa de valer, se aplicável. */
  endDate: string | null;
  active: boolean;
  notes?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  startDate: string;
  endDate: string | null;
  active: boolean;
  /** Dia do mês em que costuma vencer (1-31), apenas informativo. */
  dueDay?: number;
  notes?: string;
}

export interface VariableExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  /** Data (YYYY-MM-DD) em que a despesa ocorreu. */
  date: string;
  notes?: string;
}

export interface AppSettings {
  currency: "BRL" | "USD" | "EUR";
  theme: "light" | "dark" | "system";
  monthlySavingsGoal: number | null;
  onboardingComplete: boolean;
}

/** Um perfil = um conjunto isolado de dados (ex.: uma pessoa usando o mesmo aparelho). */
export interface ProfileMeta {
  id: string;
  name: string;
  createdAt: string;
  hasPin: boolean;
}

export interface ProfileData {
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;
}

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salario: "Salário",
  freelance: "Freelance / Autônomo",
  investimentos: "Investimentos",
  beneficios: "Benefícios / Pensão",
  aluguel_recebido: "Aluguel recebido",
  outro: "Outra fonte",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  assinaturas: "Assinaturas",
  vestuario: "Vestuário",
  dividas: "Dívidas / Empréstimos",
  outros: "Outros",
};

export const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "moradia",
  "alimentacao",
  "transporte",
  "saude",
  "educacao",
  "lazer",
  "assinaturas",
  "vestuario",
  "dividas",
  "outros",
];

export const INCOME_CATEGORY_ORDER: IncomeCategory[] = [
  "salario",
  "freelance",
  "investimentos",
  "beneficios",
  "aluguel_recebido",
  "outro",
];
