import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import clsx from "../../utils/clsx";

interface Step {
  done: boolean;
  title: string;
  description: string;
  to: string;
  cta: string;
}

export default function OnboardingChecklist({
  hasIncome,
  hasExpense,
  hasGoal,
  onSkip,
}: {
  hasIncome: boolean;
  hasExpense: boolean;
  hasGoal: boolean;
  onSkip: () => void;
}) {
  const steps: Step[] = [
    {
      done: hasIncome,
      title: "Cadastrar uma receita",
      description: "Salário, freelance, aluguel recebido ou qualquer outra fonte de renda mensal.",
      to: "/receitas",
      cta: "Cadastrar receita",
    },
    {
      done: hasExpense,
      title: "Cadastrar uma despesa",
      description: "Fixa (aluguel, internet) ou variável (mercado, lazer, imprevistos).",
      to: "/despesas",
      cta: "Cadastrar despesa",
    },
    {
      done: hasGoal,
      title: "Definir uma meta de economia (opcional)",
      description: "Acompanhe no painel quanto falta pra bater sua meta todo mês.",
      to: "/configuracoes",
      cta: "Definir meta",
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-series-1/10 p-2 text-series-1">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Vamos configurar seu painel
          </h2>
          <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
            3 passos rápidos pra começar a ver seus números.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={clsx(
              "flex items-start gap-3 rounded-lg border p-3.5",
              step.done
                ? "border-status-good/30 bg-status-good/5"
                : "border-black/5 dark:border-white/10",
            )}
          >
            <div
              className={clsx(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                step.done ? "bg-status-good text-white" : "border border-ink-muted/40",
              )}
            >
              {step.done && <Check size={12} />}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={clsx(
                  "text-sm font-medium",
                  step.done
                    ? "text-ink-secondary-light line-through dark:text-ink-secondary-dark"
                    : "text-ink-primary-light dark:text-ink-primary-dark",
                )}
              >
                {i + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
                {step.description}
              </p>
              {!step.done && (
                <Link to={step.to}>
                  <Button size="sm" variant="secondary" className="mt-2">
                    {step.cta}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-xs font-medium text-ink-muted hover:text-ink-secondary-light hover:underline dark:hover:text-ink-secondary-dark"
      >
        Pular por agora
      </button>
    </Card>
  );
}
