import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import HelpTip from "../ui/HelpTip";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ORDER,
  type ExpenseCategory,
  type FixedExpense,
  type VariableExpense,
} from "../../types";
import { todayISO } from "../../utils/date";
import clsx from "../../utils/clsx";

type ExpenseKind = "fixed" | "variable";

interface ExpenseFormProps {
  initialKind?: ExpenseKind;
  initialFixed?: FixedExpense;
  initialVariable?: VariableExpense;
  onClose: () => void;
  onSaveFixed: (data: Omit<FixedExpense, "id">) => void;
  onSaveVariable: (data: Omit<VariableExpense, "id">) => void;
}

export default function ExpenseForm({
  initialKind,
  initialFixed,
  initialVariable,
  onClose,
  onSaveFixed,
  onSaveVariable,
}: ExpenseFormProps) {
  const isEditing = !!initialFixed || !!initialVariable;
  const [kind, setKind] = useState<ExpenseKind>(
    initialKind ?? (initialVariable ? "variable" : "fixed"),
  );

  const initial = initialFixed ?? initialVariable;
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "moradia");
  const [error, setError] = useState("");

  // Campos específicos de despesa fixa
  const [startDate, setStartDate] = useState(initialFixed?.startDate ?? todayISO());
  const [hasEndDate, setHasEndDate] = useState(!!initialFixed?.endDate);
  const [endDate, setEndDate] = useState(initialFixed?.endDate ?? "");
  const [dueDay, setDueDay] = useState(initialFixed?.dueDay ? String(initialFixed.dueDay) : "");
  const [active, setActive] = useState(initialFixed?.active ?? true);

  // Campo específico de despesa variável
  const [date, setDate] = useState(initialVariable?.date ?? todayISO());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!name.trim()) {
      setError("Dê um nome para essa despesa.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (kind === "fixed") {
      const parsedDueDay = dueDay ? parseInt(dueDay, 10) : undefined;
      onSaveFixed({
        name: name.trim(),
        amount: parsedAmount,
        category,
        startDate,
        endDate: hasEndDate && endDate ? endDate : null,
        active,
        dueDay: parsedDueDay && parsedDueDay >= 1 && parsedDueDay <= 31 ? parsedDueDay : undefined,
      });
    } else {
      onSaveVariable({
        name: name.trim(),
        amount: parsedAmount,
        category,
        date,
      });
    }
  };

  return (
    <Modal title={isEditing ? "Editar despesa" : "Nova despesa"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEditing && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Tipo de despesa
              <HelpTip text="Fixas se repetem todo mês com valor parecido (aluguel, internet). Variáveis mudam ou acontecem em datas específicas (mercado, lazer)." />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind("fixed")}
                className={clsx(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  kind === "fixed"
                    ? "border-series-2 bg-series-2/10 text-series-2"
                    : "border-ink-muted/30 text-ink-secondary-light dark:text-ink-secondary-dark",
                )}
              >
                Fixa
              </button>
              <button
                type="button"
                onClick={() => setKind("variable")}
                className={clsx(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  kind === "variable"
                    ? "border-series-3 bg-series-3/10 text-series-3"
                    : "border-ink-muted/30 text-ink-secondary-light dark:text-ink-secondary-dark",
                )}
              >
                Variável
              </button>
            </div>
          </div>
        )}

        <Input
          label="Nome da despesa"
          placeholder={
            kind === "fixed" ? "Ex.: Aluguel, Internet..." : "Ex.: Supermercado, Cinema..."
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Valor"
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
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          options={EXPENSE_CATEGORY_ORDER.map((c) => ({
            value: c,
            label: EXPENSE_CATEGORY_LABELS[c],
          }))}
        />

        {kind === "fixed" ? (
          <>
            <Input
              label="Dia do vencimento (opcional)"
              type="number"
              min="1"
              max="31"
              placeholder="Ex.: 10"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            />
            <Input
              label="Cobrando desde"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                className="h-4 w-4 rounded border-ink-muted/40 text-series-2 focus:ring-series-2"
              />
              Essa despesa tem previsão de terminar
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
                className="h-4 w-4 rounded border-ink-muted/40 text-series-2 focus:ring-series-2"
              />
              Ativa (entra nos cálculos do painel)
            </label>
          </>
        ) : (
          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}

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
