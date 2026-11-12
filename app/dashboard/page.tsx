import { MetricCard } from "@/components/dashboard/metric-card";

export const metadata = {
  title: "Resumen | Pulso",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Lo que te viene pasando en los ultimos 30 dias.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Peso actual" value="--" hint="todavia no cargaste nada" />
        <MetricCard label="Delta 30d" value="--" hint="necesito 2 mediciones" />
        <MetricCard label="Gasto del mes" value="--" hint="conecta tu banco" />
        <MetricCard label="Anomalias" value="0" hint="todo tranqui" />
      </div>

      <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
        Aca van a ir los graficos de peso y plata. Por ahora esta vacio.
      </div>
    </div>
  );
}
