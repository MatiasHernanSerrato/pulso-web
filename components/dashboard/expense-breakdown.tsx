import {
  colorFor,
  formatArs,
  totalCents,
  type ExpenseByCategory,
} from "@/lib/queries/expenses";

type ExpenseBreakdownProps = {
  rows: ExpenseByCategory[];
};

export function ExpenseBreakdown({ rows }: ExpenseBreakdownProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Gastos por categoria
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          No hay movimientos este mes. Conecta mercadopago o cargá algo a mano.
        </p>
      </div>
    );
  }

  const total = totalCents(rows);
  // barras apiladas horizontales (stacked bar chart) + lista de categorias
  let offset = 0;
  const segments = rows.map((r) => {
    const w = (r.totalCents / total) * 100;
    const seg = { cat: r.category, x: offset, w, color: colorFor(r.category) };
    offset += w;
    return seg;
  });

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Gastos por categoria
          </h2>
          <p className="text-xs text-muted-foreground">Mes en curso</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {formatArs(total)}
          </div>
          <div className="text-xs text-muted-foreground">
            {rows.reduce((s, r) => s + r.count, 0)} movimientos
          </div>
        </div>
      </div>

      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className="relative flex h-full w-full">
          {segments.map((s) => (
            <div
              key={s.cat}
              style={{ width: `${s.w}%`, backgroundColor: s.color }}
              className="h-full"
              title={`${s.cat} ${s.w.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-border">
        {rows.map((r) => {
          const pct = (r.totalCents / total) * 100;
          return (
            <li
              key={r.category}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: colorFor(r.category) }}
                />
                <span className="capitalize">{r.category}</span>
                <span className="text-xs text-muted-foreground">
                  {r.count} mov
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="tabular-nums text-muted-foreground">
                  {pct.toFixed(1)}%
                </span>
                <span className="tabular-nums font-medium">
                  {formatArs(r.totalCents)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
