import type { AppSettings } from "../types";

const LOCALE_BY_CURRENCY: Record<AppSettings["currency"], string> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "de-DE",
};

export function formatCurrency(
  value: number,
  currency: AppSettings["currency"] = "BRL",
): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Versão compacta para eixos de gráfico e cartões pequenos: R$ 1,2 mil / R$ 3,4 mi */
export function formatCurrencyCompact(
  value: number,
  currency: AppSettings["currency"] = "BRL",
): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Converte string de input (aceita vírgula ou ponto) em número. */
export function parseAmountInput(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}
