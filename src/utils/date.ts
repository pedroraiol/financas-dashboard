import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/** Chave de mês no formato YYYY-MM, usada como identificador estável. */
export function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function monthKeyToDate(key: string): Date {
  return parseISO(`${key}-01`);
}

export function formatMonthLabel(key: string): string {
  return format(monthKeyToDate(key), "MMM/yy", { locale: ptBR });
}

export function formatMonthLong(key: string): string {
  const label = format(monthKeyToDate(key), "MMMM 'de' yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy");
}

/** Retorna as últimas N chaves de mês (mais antiga -> mais recente), incluindo `reference`. */
export function lastNMonthKeys(reference: Date, n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(monthKey(subMonths(reference, i)));
  }
  return keys;
}

export function shiftMonthKey(key: string, delta: number): string {
  return monthKey(addMonths(monthKeyToDate(key), delta));
}

/** Verifica se um período [startDate, endDate] cobre o mês informado. */
export function rangeCoversMonth(
  startDate: string,
  endDate: string | null,
  monthK: string,
): boolean {
  const monthStart = startOfMonth(monthKeyToDate(monthK));
  const monthEnd = endOfMonth(monthStart);
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : null;

  if (start > monthEnd) return false;
  if (end && end < monthStart) return false;
  return true;
}

export function dateIsInMonth(dateISO: string, monthK: string): boolean {
  const monthStart = startOfMonth(monthKeyToDate(monthK));
  const monthEnd = endOfMonth(monthStart);
  return isWithinInterval(parseISO(dateISO), { start: monthStart, end: monthEnd });
}
