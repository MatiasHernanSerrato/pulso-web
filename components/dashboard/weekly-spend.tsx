"use client";

import { useMemo, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";

import { formatArs } from "@/lib/queries/expenses";
import { fillMissingWeeks, type WeeklySpend } from "@/lib/queries/weekly-spend";

type WeeklySpendChartProps = {
  rows: WeeklySpend[];
  nowIso: string;
};

const MARGIN = { top: 12, right: 12, bottom: 32, left: 56 };

export function WeeklySpendChart({ rows, nowIso }: WeeklySpendChartProps) {
  const filled = useMemo(
    () => fillMissingWeeks(rows, 6, new Date(nowIso)),
    [rows, nowIso],
  );

  const total = filled.reduce((s, r) => s + r.totalCents, 0);
  const avg = total / Math.max(1, filled.length);

  if (total === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Gasto semanal
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Sin gastos cargados en las ultimas 6 semanas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Gasto semanal
          </h2>
          <p className="text-xs text-muted-foreground">Ultimas 6 semanas</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {formatArs(Math.round(avg))}
          </div>
          <div className="text-xs text-muted-foreground">promedio semanal</div>
        </div>
      </div>

      <div className="mt-4 h-56 w-full">
        <ParentSize>
          {({ width, height }) =>
            width < 10 ? null : (
              <Chart width={width} height={height} rows={filled} />
            )
          }
        </ParentSize>
      </div>
    </div>
  );
}

function Chart({
  width,
  height,
  rows,
}: {
  width: number;
  height: number;
  rows: WeeklySpend[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const innerW = Math.max(10, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(10, height - MARGIN.top - MARGIN.bottom);

  const labels = rows.map((r, i) => `${i}:${weekLabel(r.weekStart)}`);
  const max = Math.max(1, ...rows.map((r) => r.totalCents));

  const xScale = scaleBand<string>({
    domain: labels,
    range: [0, innerW],
    padding: 0.25,
  });
  const yScale = scaleLinear<number>({
    domain: [0, max * 1.1],
    range: [innerH, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} role="img" aria-label="Gasto semanal">
      <Group left={MARGIN.left} top={MARGIN.top}>
        {rows.map((r, i) => {
          const label = labels[i];
          const x = xScale(label) ?? 0;
          const w = xScale.bandwidth();
          const barH = r.totalCents === 0 ? 0 : innerH - yScale(r.totalCents);
          const active = hovered === null || hovered === i;
          return (
            <Bar
              key={label}
              x={x}
              y={innerH - barH}
              width={w}
              height={barH}
              className="fill-primary"
              opacity={active ? 1 : 0.4}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <title>{`${weekLabel(r.weekStart)} - ${formatArs(r.totalCents)} (${r.count} mov)`}</title>
            </Bar>
          );
        })}

        <AxisLeft
          scale={yScale}
          numTicks={4}
          stroke="currentColor"
          strokeOpacity={0.3}
          tickStroke="currentColor"
          tickLength={3}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: 10,
            textAnchor: "end",
            dy: "0.33em",
            dx: "-0.25em",
            className: "fill-muted-foreground",
          })}
          tickFormat={(v) => shortMoney(v as number)}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          stroke="currentColor"
          strokeOpacity={0.3}
          tickStroke="currentColor"
          tickLength={3}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: 10,
            textAnchor: "middle",
            dy: "0.75em",
            className: "fill-muted-foreground",
          })}
          tickFormat={(label) => (label as string).split(":")[1]}
        />
      </Group>
    </svg>
  );
}

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  return `${pad(day)}/${pad(month)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function shortMoney(cents: number): string {
  const v = cents / 100;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(Math.round(v));
}
