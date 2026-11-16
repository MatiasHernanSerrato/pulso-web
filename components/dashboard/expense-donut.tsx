"use client";

import { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { Pie } from "@visx/shape";

import {
  colorFor,
  formatArs,
  totalCents,
  type ExpenseByCategory,
} from "@/lib/queries/expenses";

type ExpenseDonutProps = {
  rows: ExpenseByCategory[];
};

export function ExpenseDonut({ rows }: ExpenseDonutProps) {
  const [active, setActive] = useState<string | null>(null);

  const total = useMemo(() => totalCents(rows), [rows]);
  const topRow = rows[0];

  if (rows.length === 0 || total === 0) {
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

  const highlighted = active
    ? rows.find((r) => r.category === active) ?? null
    : null;
  const center = highlighted ?? topRow;
  const centerPct = (center.totalCents / total) * 100;

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

      <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[220px]">
          <ParentSize>
            {({ width }) =>
              width < 10 ? null : (
                <Donut
                  width={width}
                  height={width}
                  rows={rows}
                  active={active}
                  onHover={setActive}
                />
              )
            }
          </ParentSize>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {center.category}
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {centerPct.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatArs(center.totalCents)}
            </div>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {rows.map((r) => {
            const pct = (r.totalCents / total) * 100;
            const highlight = active === null || active === r.category;
            return (
              <li
                key={r.category}
                onMouseEnter={() => setActive(r.category)}
                onMouseLeave={() => setActive(null)}
                className="flex items-center justify-between py-2 text-sm transition-opacity"
                style={{ opacity: highlight ? 1 : 0.4 }}
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
    </div>
  );
}

type DonutProps = {
  width: number;
  height: number;
  rows: ExpenseByCategory[];
  active: string | null;
  onHover: (cat: string | null) => void;
};

function Donut({ width, height, rows, active, onHover }: DonutProps) {
  const radius = Math.min(width, height) / 2;
  const thickness = radius * 0.3;

  return (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        <Pie
          data={rows}
          pieValue={(d) => d.totalCents}
          outerRadius={radius - 2}
          innerRadius={radius - thickness}
          padAngle={0.01}
          cornerRadius={2}
        >
          {(pie) =>
            pie.arcs.map((arc) => {
              const path = pie.path(arc) ?? "";
              const highlight = active === null || active === arc.data.category;
              return (
                <path
                  key={arc.data.category}
                  d={path}
                  fill={colorFor(arc.data.category)}
                  opacity={highlight ? 1 : 0.3}
                  onMouseEnter={() => onHover(arc.data.category)}
                  onMouseLeave={() => onHover(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            })
          }
        </Pie>
      </Group>
    </svg>
  );
}
