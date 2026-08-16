import type { AppSettings, FixedExpense, IncomeSource, VariableExpense } from "../types";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;
}

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

export function parseBackupFile(text: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(text);
    if (
      parsed &&
      Array.isArray(parsed.incomeSources) &&
      Array.isArray(parsed.fixedExpenses) &&
      Array.isArray(parsed.variableExpenses) &&
      parsed.settings
    ) {
      return parsed as BackupPayload;
    }
    return null;
  } catch {
    return null;
  }
}
