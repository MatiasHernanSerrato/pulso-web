import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WeightTrend } from "@/components/dashboard/weight-trend";
import {
  fetchExpensesThisMonth,
  formatArs,
  totalCents,
} from "@/lib/queries/expenses";
import { fetchWeightsLast4Weeks, bucketByWeek } from "@/lib/queries/weights";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Resumen | Pulso",
};

async function loadWeights() {
  const session = await getSession();
  if (!session) return [];
  try {
    return await fetchWeightsLast4Weeks(session.token);
  } catch {
    return [];
  }
}

async function loadExpenses() {
  const session = await getSession();
  if (!session) return [];
  try {
    return await fetchExpensesThisMonth(session.token);
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  // en paralelo, que no se bloqueen entre si
  const [points, expenses] = await Promise.all([loadWeights(), loadExpenses()]);

  const weeks = bucketByWeek(points, 4);
  const lastWithData = [...weeks].reverse().find((w) => w.avgKg !== null);
  const firstWithData = weeks.find((w) => w.avgKg !== null);
  const delta =
    lastWithData && firstWithData && lastWithData !== firstWithData
      ? (lastWithData.avgKg as number) - (firstWithData.avgKg as number)
      : null;

  const currentWeight = lastWithData?.avgKg ?? null;

  const spendCents = totalCents(expenses);
  const topCategory = expenses[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Lo que te viene pasando en los ultimos 30 dias.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Peso actual"
          value={currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : "--"}
          hint={
            currentWeight !== null
              ? `promedio ${lastWithData?.weekLabel}`
              : "todavia no cargaste nada"
          }
        />
        <MetricCard
          label="Delta 4 semanas"
          value={
            delta !== null
              ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} kg`
              : "--"
          }
          hint={delta !== null ? "vs primera semana" : "necesito 2 mediciones"}
        />
        <MetricCard
          label="Gasto del mes"
          value={spendCents > 0 ? formatArs(spendCents) : "--"}
          hint={
            topCategory
              ? `mayor: ${topCategory.category}`
              : "conecta tu banco"
          }
        />
        <MetricCard label="Anomalias" value="0" hint="todo tranqui" />
      </div>

      <WeightTrend points={points} />
      <ExpenseBreakdown rows={expenses} />
    </div>
  );
}
