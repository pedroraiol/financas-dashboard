import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { INCOME_CATEGORY_LABELS, INCOME_CATEGORY_ORDER, type IncomeSource } from "../../types";
import { todayISO } from "../../utils/date";

interface IncomeFormProps {
  initial?: IncomeSource;
  onSave: (data: Omit<IncomeSource, "id">) => void;
  onClose: () => void;
}

export default function IncomeForm({ initial, onSave, onClose }: IncomeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "salario");
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [hasEndDate, setHasEndDate] = useState(!!initial?.endDate);
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim()) {
      setError("Dê um nome para essa fonte de renda.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor mensal maior que zero.");
      return;
    }
    onSave({
      name: name.trim(),
      amount: parsedAmount,
      category,
      startDate,
      endDate: hasEndDate && endDate ? endDate : null,
      active,
    });
  };

  return (
    <Modal title={initial ? "Editar renda" : "Nova fonte de renda"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome da fonte"
          placeholder="Ex.: Salário CLT, Freelance de design..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Valor mensal"
          help="O valor que essa fonte costuma trazer todo mês."
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value as IncomeSource["category"])}
          options={INCOME_CATEGORY_ORDER.map((c) => ({ value: c, label: INCOME_CATEGORY_LABELS[c] }))}
        />
        <Input
          label="Recebendo desde"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          <input
            type="checkbox"
            checked={hasEndDate}
            onChange={(e) => setHasEndDate(e.target.checked)}
            className="h-4 w-4 rounded border-ink-muted/40 text-series-1 focus:ring-series-1"
          />
          Essa renda tem previsão de terminar
        </label>
        {hasEndDate && (
          <Input
            label="Até quando"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        )}
        <label className="flex items-center gap-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-ink-muted/40 text-series-1 focus:ring-series-1"
          />
          Ativa (entra nos cálculos do painel)
        </label>

        {error && <p className="text-xs text-status-critical">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
