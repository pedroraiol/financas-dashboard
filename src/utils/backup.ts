import type { AppSettings, FixedExpense, IncomeSource, VariableExpense } from "../types";
import { EXPENSE_CATEGORY_ORDER, INCOME_CATEGORY_ORDER } from "../types";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;
}

/** Limite defensivo: um backup legítimo desse app nunca chega perto disso. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_ITEMS_PER_LIST = 20_000;

export function downloadBackup(payload: Omit<BackupPayload, "version" | "exportedAt">) {
  const data: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...payload,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-financas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Aceita apenas datas no formato YYYY-MM-DD (mesmo formato usado por todo o app). */
function isIsoDateString(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

function isValidIncome(v: unknown): v is IncomeSource {
  if (!isPlainObject(v)) return false;
  return (
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.name) &&
    isFiniteNumber(v.amount) &&
    v.amount >= 0 &&
    typeof v.category === "string" &&
    (INCOME_CATEGORY_ORDER as string[]).includes(v.category) &&
    isIsoDateString(v.startDate) &&
    (v.endDate === null || isIsoDateString(v.endDate)) &&
    typeof v.active === "boolean" &&
    (v.notes === undefined || typeof v.notes === "string")
  );
}

function isValidFixedExpense(v: unknown): v is FixedExpense {
  if (!isPlainObject(v)) return false;
  return (
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.name) &&
    isFiniteNumber(v.amount) &&
    v.amount >= 0 &&
    typeof v.category === "string" &&
    (EXPENSE_CATEGORY_ORDER as string[]).includes(v.category) &&
    isIsoDateString(v.startDate) &&
    (v.endDate === null || isIsoDateString(v.endDate)) &&
    typeof v.active === "boolean" &&
    (v.dueDay === undefined || (isFiniteNumber(v.dueDay) && v.dueDay >= 1 && v.dueDay <= 31)) &&
    (v.notes === undefined || typeof v.notes === "string")
  );
}

function isValidVariableExpense(v: unknown): v is VariableExpense {
  if (!isPlainObject(v)) return false;
  return (
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.name) &&
    isFiniteNumber(v.amount) &&
    v.amount >= 0 &&
    typeof v.category === "string" &&
    (EXPENSE_CATEGORY_ORDER as string[]).includes(v.category) &&
    isIsoDateString(v.date) &&
    (v.notes === undefined || typeof v.notes === "string")
  );
}

function isValidSettings(v: unknown): v is AppSettings {
  if (!isPlainObject(v)) return false;
  return (
    ["BRL", "USD", "EUR"].includes(v.currency as string) &&
    ["light", "dark", "system"].includes(v.theme as string) &&
    (v.monthlySavingsGoal === null || isFiniteNumber(v.monthlySavingsGoal)) &&
    typeof v.onboardingComplete === "boolean"
  );
}

/**
 * Valida estritamente um arquivo de backup antes de aceitar seus dados.
 * O arquivo é uma entrada não confiável (pode ter sido editado à mão, corrompido,
 * ou vir de outra pessoa) — por isso cada campo é checado, não só a forma geral do JSON.
 */
export function parseBackupFile(text: string): BackupPayload | null {
  if (text.length > MAX_FILE_SIZE_BYTES) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isPlainObject(parsed)) return null;
  const { incomeSources, fixedExpenses, variableExpenses, settings } = parsed;

  if (
    !Array.isArray(incomeSources) ||
    !Array.isArray(fixedExpenses) ||
    !Array.isArray(variableExpenses) ||
    incomeSources.length > MAX_ITEMS_PER_LIST ||
    fixedExpenses.length > MAX_ITEMS_PER_LIST ||
    variableExpenses.length > MAX_ITEMS_PER_LIST
  ) {
    return null;
  }

  if (!incomeSources.every(isValidIncome)) return null;
  if (!fixedExpenses.every(isValidFixedExpense)) return null;
  if (!variableExpenses.every(isValidVariableExpense)) return null;
  if (!isValidSettings(settings)) return null;

  return {
    version: 1,
    exportedAt: isNonEmptyString(parsed.exportedAt) ? parsed.exportedAt : new Date().toISOString(),
    incomeSources,
    fixedExpenses,
    variableExpenses,
    settings,
  };
}
