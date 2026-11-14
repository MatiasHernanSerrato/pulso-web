import { gql } from "@/lib/api";

export type ExpenseByCategory = {
  category: string;
  totalCents: number;
  count: number;
};

export type ExpensesByCategoryQuery = {
  expensesByCategory: ExpenseByCategory[];
};

const EXPENSES_BY_CATEGORY = /* GraphQL */ `
  query ExpensesByCategory($from: Time!, $to: Time!) {
    expensesByCategory(from: $from, to: $to) {
      category
      totalCents
      count
    }
  }
`;

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - 1,
  );
}

export async function fetchExpensesThisMonth(
  token: string,
  now: Date = new Date(),
): Promise<ExpenseByCategory[]> {
  const from = startOfMonth(now);
  const to = endOfMonth(now);
  const data = await gql<ExpensesByCategoryQuery>(
    EXPENSES_BY_CATEGORY,
    { from: from.toISOString(), to: to.toISOString() },
    token,
  );
  return [...data.expensesByCategory].sort(
    (a, b) => b.totalCents - a.totalCents,
  );
}

export function formatArs(cents: number): string {
  // Intl.NumberFormat devuelve espacios NBSP y u202f en algunos runtimes y
  // espacios normales en otros. En SSR node vs el browser eso daba un
  // hydration mismatch cuando el formateo se hacia en un client component.
  // Normalizamos a espacios comunes para que el output sea deterministico.
  const value = cents / 100;
  const raw = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
  return raw.replace(/[   ]/g, " ");
}

export function totalCents(rows: ExpenseByCategory[]): number {
  return rows.reduce((sum, r) => sum + r.totalCents, 0);
}

// paleta estable por nombre de categoria (para que no salte entre renders)
const PALETTE = [
  "#2563eb", // azul
  "#16a34a", // verde
  "#ea580c", // naranja
  "#9333ea", // violeta
  "#dc2626", // rojo
  "#0891b2", // cyan
  "#ca8a04", // amarillo
  "#64748b", // gris
];

export function colorFor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

// util para tests: siempre me gusta dejar algo exportable
export const _msInDay = MS_IN_DAY;
