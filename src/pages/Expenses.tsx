import { useState } from "react";
import { Plus, Receipt, CalendarClock, SearchX } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import { useFinanceStore } from "../store/useFinanceStore";
import { useToast } from "../components/ui/ToastProvider";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ORDER,
  type ExpenseCategory,
  type FixedExpense,
  type VariableExpense,
} from "../types";
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

type DeleteState =
  { kind: "fixed"; item: FixedExpense } | { kind: "variable"; item: VariableExpense } | null;

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
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ExpenseKind>("fixed");
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<DeleteState>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "">("");

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

  const matchesFilter = (item: { name: string; category: ExpenseCategory }) =>
    (!categoryFilter || item.category === categoryFilter) &&
    item.name.toLowerCase().includes(search.trim().toLowerCase());

  const activeItems = activeTab === "fixed" ? fixedExpenses : sortedVariable;
  const filteredItems = activeItems.filter(matchesFilter);
  const isFiltering = search.trim() !== "" || categoryFilter !== "";

  return (
    <>
      <Header title="Despesas" subtitle="Separe o que é fixo do que varia mês a mês" />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-1">
          <button
            type="button"
            onClick={() => setActiveTab("fixed")}
            className={clsx(
              "flex flex-col items-start rounded-md px-4 py-2 text-left transition-colors",
              activeTab === "fixed" ? "bg-series-2/10" : "hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <span
              className={clsx(
                "text-xs font-medium",
                activeTab === "fixed"
                  ? "text-series-2"
                  : "text-ink-secondary-light dark:text-ink-secondary-dark",
              )}
            >
              Fixas · {fixedExpenses.length}
            </span>
            <span
              className={clsx(
                "text-sm font-semibold",
                activeTab === "fixed"
                  ? "text-series-2"
                  : "text-ink-primary-light dark:text-ink-primary-dark",
              )}
            >
              {formatCurrency(totalFixed, currency)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variable")}
            className={clsx(
              "flex flex-col items-start rounded-md px-4 py-2 text-left transition-colors",
              activeTab === "variable"
                ? "bg-series-3/10"
                : "hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <span
              className={clsx(
                "text-xs font-medium",
                activeTab === "variable"
                  ? "text-series-3"
                  : "text-ink-secondary-light dark:text-ink-secondary-dark",
              )}
            >
              Variáveis · {variableExpenses.length}
            </span>
            <span
              className={clsx(
                "text-sm font-semibold",
                activeTab === "variable"
                  ? "text-series-3"
                  : "text-ink-primary-light dark:text-ink-primary-dark",
              )}
            >
              {formatCurrency(totalVariable, currency)}
            </span>
          </button>
        </div>
        <Button
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setForm({ mode: "new", kind: activeTab })}
        >
          Nova despesa
        </Button>
      </div>

      {activeItems.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              label="Buscar por nome"
              placeholder="Ex.: Aluguel, Mercado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-56">
            <Select
              label="Categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "")}
              options={[
                { value: "", label: "Todas as categorias" },
                ...EXPENSE_CATEGORY_ORDER.map((c) => ({
                  value: c,
                  label: EXPENSE_CATEGORY_LABELS[c],
                })),
              ]}
            />
          </div>
        </div>
      )}

      <Card className="mt-3">
        {activeItems.length === 0 ? (
          activeTab === "fixed" ? (
            <EmptyState
              icon={<CalendarClock size={22} />}
              title="Nenhuma despesa fixa cadastrada"
              description="Aluguel, financiamento, internet, plano de saúde... tudo que se repete todo mês com valor parecido."
              action={
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setForm({ mode: "new", kind: "fixed" })}
                >
                  Cadastrar despesa fixa
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Receipt size={22} />}
              title="Nenhuma despesa variável cadastrada"
              description="Supermercado, lazer, roupas, imprevistos... despesas que mudam de valor ou acontecem em datas específicas."
              action={
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setForm({ mode: "new", kind: "variable" })}
                >
                  Cadastrar despesa variável
                </Button>
              }
            />
          )
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<SearchX size={22} />}
            title="Nenhum resultado para esse filtro"
            description="Tente buscar por outro nome ou limpar o filtro de categoria."
          />
        ) : activeTab === "fixed" ? (
          <ExpenseList
            items={filteredItems as FixedExpense[]}
            accent="series-2"
            onEdit={(item) => setForm({ mode: "edit", kind: "fixed", item })}
            onDelete={(item) => setDeleting({ kind: "fixed", item })}
          />
        ) : (
          <ExpenseList
            items={filteredItems as VariableExpense[]}
            accent="series-3"
            onEdit={(item) => setForm({ mode: "edit", kind: "variable", item })}
            onDelete={(item) => setDeleting({ kind: "variable", item })}
          />
        )}
      </Card>

      {isFiltering && activeItems.length > 0 && filteredItems.length > 0 && (
        <p className="mt-2 text-xs text-ink-muted">
          Mostrando {filteredItems.length} de {activeItems.length} despesas.
        </p>
      )}

      {form && (
        <ExpenseForm
          initialKind={form.kind}
          initialFixed={form.mode === "edit" && form.kind === "fixed" ? form.item : undefined}
          initialVariable={form.mode === "edit" && form.kind === "variable" ? form.item : undefined}
          onClose={() => setForm(null)}
          onSaveFixed={(data) => {
            if (form.mode === "edit" && form.kind === "fixed") {
              updateFixedExpense(form.item.id, data);
              toast.success("Despesa fixa atualizada");
            } else {
              addFixedExpense(data);
              toast.success("Despesa fixa adicionada");
            }
            setActiveTab("fixed");
            setForm(null);
          }}
          onSaveVariable={(data) => {
            if (form.mode === "edit" && form.kind === "variable") {
              updateVariableExpense(form.item.id, data);
              toast.success("Despesa variável atualizada");
            } else {
              addVariableExpense(data);
              toast.success("Despesa variável adicionada");
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
            toast.success("Despesa excluída");
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
