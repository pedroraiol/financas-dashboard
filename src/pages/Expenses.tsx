import { useState } from "react";
import { Plus, Receipt, CalendarClock } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import { useFinanceStore } from "../store/useFinanceStore";
import type { FixedExpense, VariableExpense } from "../types";
import { formatCurrency } from "../utils/currency";
import { activeFixedExpensesForMonth, variableExpensesForMonth } from "../utils/calculations";
import { monthKey } from "../utils/date";
import clsx from "../utils/clsx";

type ExpenseKind = "fixed" | "variable";

type FormState =
  | { mode: "new"; kind: ExpenseKind }
  | { mode: "edit"; kind: "fixed"; item: FixedExpense }
  | { mode: "edit"; kind: "variable"; item: VariableExpense }
  | null;

type DeleteState = { kind: "fixed"; item: FixedExpense } | { kind: "variable"; item: VariableExpense } | null;

export default function Expenses() {
  const fixedExpenses = useFinanceStore((s) => s.fixedExpenses);
  const variableExpenses = useFinanceStore((s) => s.variableExpenses);
  const addFixedExpense = useFinanceStore((s) => s.addFixedExpense);
  const updateFixedExpense = useFinanceStore((s) => s.updateFixedExpense);
  const removeFixedExpense = useFinanceStore((s) => s.removeFixedExpense);
  const addVariableExpense = useFinanceStore((s) => s.addVariableExpense);
  const updateVariableExpense = useFinanceStore((s) => s.updateVariableExpense);
  const removeVariableExpense = useFinanceStore((s) => s.removeVariableExpense);
  const currency = useFinanceStore((s) => s.settings.currency);

  const [activeTab, setActiveTab] = useState<ExpenseKind>("fixed");
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<DeleteState>(null);

  const currentMonth = monthKey(new Date());
  const totalFixed = activeFixedExpensesForMonth(fixedExpenses, currentMonth).reduce(
    (acc, e) => acc + e.amount,
    0,
  );
  const totalVariable = variableExpensesForMonth(variableExpenses, currentMonth).reduce(
    (acc, e) => acc + e.amount,
    0,
  );

  const sortedVariable = [...variableExpenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Header title="Despesas" subtitle="Separe o que é fixo do que varia mês a mês" />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setActiveTab("fixed")}
          className={clsx(
            "rounded-card border p-5 text-left shadow-sm transition-colors",
            activeTab === "fixed"
              ? "border-series-2 bg-series-2/5"
              : "border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark hover:border-series-2/40",
          )}
        >
          <h3 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Despesas fixas (mês atual)
          </h3>
          <p className="mt-2 text-2xl font-semibold text-series-2">{formatCurrency(totalFixed, currency)}</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("variable")}
          className={clsx(
            "rounded-card border p-5 text-left shadow-sm transition-colors",
            activeTab === "variable"
              ? "border-series-3 bg-series-3/5"
              : "border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark hover:border-series-3/40",
          )}
        >
          <h3 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Despesas variáveis (mês atual)
          </h3>
          <p className="mt-2 text-2xl font-semibold text-series-3">{formatCurrency(totalVariable, currency)}</p>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("fixed")}
            className={clsx(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === "fixed"
                ? "bg-series-2/10 text-series-2"
                : "text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            Fixas ({fixedExpenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variable")}
            className={clsx(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === "variable"
                ? "bg-series-3/10 text-series-3"
                : "text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            Variáveis ({variableExpenses.length})
          </button>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setForm({ mode: "new", kind: activeTab })}>
          Nova despesa
        </Button>
      </div>

      <Card className="mt-3">
        {activeTab === "fixed" ? (
          fixedExpenses.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={22} />}
              title="Nenhuma despesa fixa cadastrada"
              description="Aluguel, financiamento, internet, plano de saúde... tudo que se repete todo mês com valor parecido."
              action={
                <Button icon={<Plus size={16} />} onClick={() => setForm({ mode: "new", kind: "fixed" })}>
                  Cadastrar despesa fixa
                </Button>
              }
            />
          ) : (
            <ExpenseList
              items={fixedExpenses}
              accent="series-2"
              onEdit={(item) => setForm({ mode: "edit", kind: "fixed", item })}
              onDelete={(item) => setDeleting({ kind: "fixed", item })}
            />
          )
        ) : variableExpenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="Nenhuma despesa variável cadastrada"
            description="Supermercado, lazer, roupas, imprevistos... despesas que mudam de valor ou acontecem em datas específicas."
            action={
              <Button icon={<Plus size={16} />} onClick={() => setForm({ mode: "new", kind: "variable" })}>
                Cadastrar despesa variável
              </Button>
            }
          />
        ) : (
          <ExpenseList
            items={sortedVariable}
            accent="series-3"
            onEdit={(item) => setForm({ mode: "edit", kind: "variable", item })}
            onDelete={(item) => setDeleting({ kind: "variable", item })}
          />
        )}
      </Card>

      {form && (
        <ExpenseForm
          initialKind={form.kind}
          initialFixed={form.mode === "edit" && form.kind === "fixed" ? form.item : undefined}
          initialVariable={form.mode === "edit" && form.kind === "variable" ? form.item : undefined}
          onClose={() => setForm(null)}
          onSaveFixed={(data) => {
            if (form.mode === "edit" && form.kind === "fixed") {
              updateFixedExpense(form.item.id, data);
            } else {
              addFixedExpense(data);
            }
            setActiveTab("fixed");
            setForm(null);
          }}
          onSaveVariable={(data) => {
            if (form.mode === "edit" && form.kind === "variable") {
              updateVariableExpense(form.item.id, data);
            } else {
              addVariableExpense(data);
            }
            setActiveTab("variable");
            setForm(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir despesa"
          message={`Tem certeza que deseja excluir "${deleting.item.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            if (deleting.kind === "fixed") {
              removeFixedExpense(deleting.item.id);
            } else {
              removeVariableExpense(deleting.item.id);
            }
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
