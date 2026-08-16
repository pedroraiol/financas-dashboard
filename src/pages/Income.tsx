import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import IncomeForm from "../components/income/IncomeForm";
import IncomeList from "../components/income/IncomeList";
import { useFinanceStore } from "../store/useFinanceStore";
import type { IncomeSource } from "../types";
import { formatCurrency } from "../utils/currency";
import { activeIncomeForMonth } from "../utils/calculations";
import { monthKey } from "../utils/date";

export default function Income() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const addIncomeSource = useFinanceStore((s) => s.addIncomeSource);
  const updateIncomeSource = useFinanceStore((s) => s.updateIncomeSource);
  const removeIncomeSource = useFinanceStore((s) => s.removeIncomeSource);
  const currency = useFinanceStore((s) => s.settings.currency);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [deleting, setDeleting] = useState<IncomeSource | null>(null);

  const currentMonth = monthKey(new Date());
  const totalThisMonth = activeIncomeForMonth(incomeSources, currentMonth).reduce(
    (acc, s) => acc + s.amount,
    0,
  );

  return (
    <>
      <Header title="Receitas" subtitle="Cadastre todas as suas fontes de renda mensal" />

      <Card className="mt-5" title="Total de receitas ativas (mês atual)">
        <p className="text-2xl font-semibold text-series-1">{formatCurrency(totalThisMonth, currency)}</p>
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          Fontes de renda ({incomeSources.length})
        </h2>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          Nova receita
        </Button>
      </div>

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
        ) : (
          <IncomeList items={incomeSources} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </Card>

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
            } else {
              addIncomeSource(data);
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
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
