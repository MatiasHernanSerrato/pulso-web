import { gql } from "@/lib/api";

export type WeeklySpend = {
  weekStart: string;
  totalCents: number;
  count: number;
};

export type WeeklySpendQuery = {
  weeklySpend: WeeklySpend[];
};

const WEEKLY_SPEND = /* GraphQL */ `
  query WeeklySpend($from: Time!, $to: Time!) {
    weeklySpend(from: $from, to: $to) {
      weekStart
      totalCents
      count
    }
  }
`;

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export async function fetchWeeklySpendLast6Weeks(
  token: string,
  now: Date = new Date(),
): Promise<WeeklySpend[]> {
  const to = now;
  const from = new Date(to.getTime() - 42 * MS_IN_DAY);
  const data = await gql<WeeklySpendQuery>(
    WEEKLY_SPEND,
    { from: from.toISOString(), to: to.toISOString() },
    token,
  );
  return [...data.weeklySpend].sort(
    (a, b) =>
      new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
  );
}

export function fillMissingWeeks(
  rows: WeeklySpend[],
  weeks = 6,
  now: Date = new Date(),
): WeeklySpend[] {
  // el backend devuelve solo semanas con gastos; para el bar chart quiero
  // slots fijos aunque un slot quede en 0.
  const out: WeeklySpend[] = [];
  const currentStart = startOfIsoWeek(now);

  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(currentStart.getTime() - i * 7 * MS_IN_DAY);
    const iso = d.toISOString();
    const found = rows.find(
      (r) => new Date(r.weekStart).getTime() === d.getTime(),
    );
    out.push(
      found ?? {
        weekStart: iso,
        totalCents: 0,
        count: 0,
      },
    );
  }
  return out;
}

function startOfIsoWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}
