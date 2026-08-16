import ExcelJS from "exceljs";
import type { AppSettings, FixedExpense, IncomeSource, VariableExpense } from "../types";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "../types";
import { formatDateShort } from "./date";

const CURRENCY_FORMAT: Record<AppSettings["currency"], string> = {
  BRL: '"R$" #,##0.00',
  USD: '"$" #,##0.00',
  EUR: '"€" #,##0.00',
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEFEFEF" },
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = HEADER_FILL;
  });
  row.commit();
}

export async function downloadSpreadsheet({
  incomeSources,
  fixedExpenses,
  variableExpenses,
  settings,
}: {
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Meu Painel Financeiro";
  workbook.created = new Date();

  const amountFormat = CURRENCY_FORMAT[settings.currency];

  const incomeSheet = workbook.addWorksheet("Receitas");
  incomeSheet.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "Categoria", key: "category", width: 20 },
    { header: "Valor mensal", key: "amount", width: 16, style: { numFmt: amountFormat } },
    { header: "Ativa", key: "active", width: 10 },
    { header: "Recebendo desde", key: "startDate", width: 16 },
    { header: "Até quando", key: "endDate", width: 16 },
    { header: "Observações", key: "notes", width: 32 },
  ];
  for (const s of incomeSources) {
    incomeSheet.addRow({
      name: s.name,
      category: INCOME_CATEGORY_LABELS[s.category],
      amount: s.amount,
      active: s.active ? "Sim" : "Não",
      startDate: formatDateShort(s.startDate),
      endDate: s.endDate ? formatDateShort(s.endDate) : "",
      notes: s.notes ?? "",
    });
  }
  styleHeader(incomeSheet.getRow(1));

  const fixedSheet = workbook.addWorksheet("Despesas Fixas");
  fixedSheet.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "Categoria", key: "category", width: 20 },
    { header: "Valor", key: "amount", width: 16, style: { numFmt: amountFormat } },
    { header: "Ativa", key: "active", width: 10 },
    { header: "Dia do vencimento", key: "dueDay", width: 16 },
    { header: "Cobrando desde", key: "startDate", width: 16 },
    { header: "Até quando", key: "endDate", width: 16 },
    { header: "Observações", key: "notes", width: 32 },
  ];
  for (const e of fixedExpenses) {
    fixedSheet.addRow({
      name: e.name,
      category: EXPENSE_CATEGORY_LABELS[e.category],
      amount: e.amount,
      active: e.active ? "Sim" : "Não",
      dueDay: e.dueDay ?? "",
      startDate: formatDateShort(e.startDate),
      endDate: e.endDate ? formatDateShort(e.endDate) : "",
      notes: e.notes ?? "",
    });
  }
  styleHeader(fixedSheet.getRow(1));

  const variableSheet = workbook.addWorksheet("Despesas Variáveis");
  variableSheet.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "Categoria", key: "category", width: 20 },
    { header: "Valor", key: "amount", width: 16, style: { numFmt: amountFormat } },
    { header: "Data", key: "date", width: 16 },
    { header: "Observações", key: "notes", width: 32 },
  ];
  for (const e of [...variableExpenses].sort((a, b) => a.date.localeCompare(b.date))) {
    variableSheet.addRow({
      name: e.name,
      category: EXPENSE_CATEGORY_LABELS[e.category],
      amount: e.amount,
      date: formatDateShort(e.date),
      notes: e.notes ?? "",
    });
  }
  styleHeader(variableSheet.getRow(1));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financas-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
