import {
  Banknote,
  Building2,
  Car,
  CreditCard,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  MoreHorizontal,
  Popcorn,
  Repeat,
  Shirt,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { ExpenseCategory, IncomeCategory } from "../types";

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  moradia: Home,
  alimentacao: UtensilsCrossed,
  transporte: Car,
  saude: Heart,
  educacao: GraduationCap,
  lazer: Popcorn,
  assinaturas: Repeat,
  vestuario: Shirt,
  dividas: CreditCard,
  outros: MoreHorizontal,
};

export const INCOME_CATEGORY_ICONS: Record<IncomeCategory, LucideIcon> = {
  salario: Banknote,
  freelance: Laptop,
  investimentos: TrendingUp,
  beneficios: Gift,
  aluguel_recebido: Building2,
  outro: MoreHorizontal,
};
