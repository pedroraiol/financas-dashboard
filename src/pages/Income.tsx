import { useState } from "react";
import { Plus, SearchX, Wallet } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import IncomeForm from "../components/income/IncomeForm";
import IncomeList from "../components/income/IncomeList";
import { useFinanceStore } from "../store/useFinanceStore";
import { useToast } from "../components/ui/ToastProvider";
import {
  INCOME_CATEGORY_LABELS,
  INCOME_CATEGORY_ORDER,
  type IncomeCategory,
  type IncomeSource,
} from "../types";
import { formatCurrency } from "../utils/currency";
import { activeIncomeForMonth } from "../utils/calculations";
import { monthKey } from "../utils/date";

export default function Income() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const addIncomeSource = useFinanceStore((s) => s.addIncomeSource);
  const updateIncomeSource = useFinanceStore((s) => s.updateIncomeSource);
  const removeIncomeSource = useFinanceStore((s) => s.removeIncomeSource);
  const currency = useFinanceStore((s) => s.settings.currency);
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [deleting, setDeleting] = useState<IncomeSource | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<IncomeCategory | "">("");

  const currentMonth = monthKey(new Date());
  const totalThisMonth = activeIncomeForMonth(incomeSources, currentMonth).reduce(
    (acc, s) => acc + s.amount,
    0,
  );

  const filteredSources = incomeSources.filter(
    (item) =>
      (!categoryFilter || item.category === categoryFilter) &&
      item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const isFiltering = search.trim() !== "" || categoryFilter !== "";

  return (
    <>
      <Header title="Receitas" subtitle="Cadastre todas as suas fontes de renda mensal" />

      <Card className="mt-5" title="Total de receitas ativas (mês atual)">
        <p className="text-lg font-semibold text-series-1">
          {formatCurrency(totalThisMonth, currency)}
        </p>
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          Fontes de renda ({incomeSources.length})
        </h2>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          Nova receita
        </Button>
      </div>

      {incomeSources.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              label="Buscar por nome"
              placeholder="Ex.: Salário, Freelance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-56">
            <Select
              label="Categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as IncomeCategory | "")}
              options={[
                { value: "", label: "Todas as categorias" },
                ...INCOME_CATEGORY_ORDER.map((c) => ({
                  value: c,
                  label: INCOME_CATEGORY_LABELS[c],
                })),
              ]}
            />
          </div>
        </div>
      )}

      <Card className="mt-3">
        {incomeSources.length === 0 ? (
          <EmptyState
            icon={<Wallet size={22} />}
            title="Nenhuma fonte de renda cadastrada"
            description="Adicione salário, freelances, aluguéis recebidos ou qualquer outra renda mensal. Você pode cadastrar quantas fontes precisar."
            action={
              <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
                Cadastrar primeira receita
              </Button>
            }
          />
        ) : filteredSources.length === 0 ? (
          <EmptyState
            icon={<SearchX size={22} />}
            title="Nenhum resultado para esse filtro"
            description="Tente buscar por outro nome ou limpar o filtro de categoria."
          />
        ) : (
          <IncomeList items={filteredSources} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </Card>

      {isFiltering && incomeSources.length > 0 && filteredSources.length > 0 && (
        <p className="mt-2 text-xs text-ink-muted">
          Mostrando {filteredSources.length} de {incomeSources.length} fontes de renda.
        </p>
      )}

      {(formOpen || editing) && (
        <IncomeForm
          initial={editing ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={(data) => {
            if (editing) {
              updateIncomeSource(editing.id, data);
              toast.success("Fonte de renda atualizada");
            } else {
              addIncomeSource(data);
              toast.success("Fonte de renda adicionada");
            }
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir fonte de renda"
          message={`Tem certeza que deseja excluir "${deleting.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            removeIncomeSource(deleting.id);
            toast.success("Fonte de renda excluída");
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
