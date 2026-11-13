import { bucketByWeek, type WeightPoint } from "@/lib/queries/weights";

type WeightTrendProps = {
  points: WeightPoint[];
};

export function WeightTrend({ points }: WeightTrendProps) {
  const weeks = bucketByWeek(points, 4);
  const validWeeks = weeks.filter((w) => w.avgKg !== null);

  if (validWeeks.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Peso por semana
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Todavia no hay mediciones en las ultimas 4 semanas. Cargá algo desde la
          app mobile para verlo acá.
        </p>
      </div>
    );
  }

  const values = validWeeks.map((w) => w.avgKg as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // SVG geometry: viewBox 400x120, 40px padding lateral, 20 top/bottom
  const vbW = 400;
  const vbH = 120;
  const padX = 40;
  const padY = 20;
  const innerW = vbW - padX * 2;
  const innerH = vbH - padY * 2;

  const step = weeks.length > 1 ? innerW / (weeks.length - 1) : 0;

  const coords = weeks.map((w, i) => {
    const x = padX + i * step;
    if (w.avgKg === null) return { x, y: null, w };
    const y = padY + innerH - ((w.avgKg - min) / range) * innerH;
    return { x, y, w };
  });

  const linePoints = coords
    .filter((c) => c.y !== null)
    .map((c) => `${c.x.toFixed(1)},${(c.y as number).toFixed(1)}`)
    .join(" ");

  const delta =
    validWeeks.length >= 2
      ? (validWeeks[validWeeks.length - 1].avgKg as number) -
        (validWeeks[0].avgKg as number)
      : null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Peso por semana
          </h2>
          <p className="text-xs text-muted-foreground">
            Promedio semanal, ultimas 4 semanas
          </p>
        </div>
        {delta !== null ? (
          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums">
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} kg
            </div>
            <div className="text-xs text-muted-foreground">vs 4 semanas atras</div>
          </div>
        ) : null}
      </div>

      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="mt-4 h-40 w-full"
        role="img"
        aria-label="Tendencia de peso por semana"
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {coords.map((c, i) =>
          c.y === null ? null : (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={3}
              className="fill-primary"
            />
          ),
        )}
        {coords.map((c, i) => (
          <text
            key={`lbl-${i}`}
            x={c.x}
            y={vbH - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {c.w.weekLabel}
          </text>
        ))}
      </svg>
    </div>
  );
}
