import { gql } from "@/lib/api";

export type WeightPoint = {
  recordedAt: string;
  valueKg: number;
};

export type WeightsRangeQuery = {
  weightsInRange: WeightPoint[];
};

const WEIGHTS_IN_RANGE = /* GraphQL */ `
  query WeightsInRange($from: Time!, $to: Time!) {
    weightsInRange(from: $from, to: $to) {
      recordedAt
      valueKg
    }
  }
`;

export type WeekBucket = {
  weekStart: Date;
  weekLabel: string;
  avgKg: number | null;
  points: number;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function startOfWeek(date: Date): Date {
  // ISO week: lunes como primer dia
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export function bucketByWeek(
  points: WeightPoint[],
  weeks = 4,
  now: Date = new Date(),
): WeekBucket[] {
  // now entra por param para que el server pueda pre-calcular y pasar el
  // mismo valor a cualquier chart client, evitando mismatch de hydration.
  const currentWeekStart = startOfWeek(now);

  const buckets: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart.getTime() - i * 7 * MS_IN_DAY);
    buckets.push({
      weekStart,
      weekLabel: weekLabelFor(weekStart),
      avgKg: null,
      points: 0,
    });
  }

  for (const p of points) {
    const t = new Date(p.recordedAt);
    const weekStart = startOfWeek(t).getTime();
    const bucket = buckets.find((b) => b.weekStart.getTime() === weekStart);
    if (!bucket) continue;
    bucket.points += 1;
    bucket.avgKg =
      bucket.avgKg === null
        ? p.valueKg
        : bucket.avgKg + (p.valueKg - bucket.avgKg) / bucket.points;
  }

  return buckets;
}

function weekLabelFor(weekStart: Date): string {
  const d = weekStart.getUTCDate();
  const m = weekStart.getUTCMonth() + 1;
  return `${pad(d)}/${pad(m)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export async function fetchWeightsLast4Weeks(
  token: string,
): Promise<WeightPoint[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 28 * MS_IN_DAY);
  const data = await gql<WeightsRangeQuery>(
    WEIGHTS_IN_RANGE,
    { from: from.toISOString(), to: to.toISOString() },
    token,
  );
  return data.weightsInRange;
}
