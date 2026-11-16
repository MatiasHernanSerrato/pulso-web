"use client";

import { useMemo, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";

import {
  severityColor,
  severityLabel,
  type Anomaly,
} from "@/lib/queries/anomalies";
import type { WeightPoint } from "@/lib/queries/weights";

type AnomaliesWidgetProps = {
  points: WeightPoint[];
  anomalies: Anomaly[];
  nowIso: string;
};

const MARGIN = { top: 12, right: 16, bottom: 28, left: 36 };
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function AnomaliesWidget({
  points,
  anomalies,
  nowIso,
}: AnomaliesWidgetProps) {
  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const weightAnoms = useMemo(
    () => anomalies.filter((a) => a.metric === "weight" && a.valueKg !== null),
    [anomalies],
  );

  if (points.length === 0 && weightAnoms.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Anomalias detectadas
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Cuando tengamos mas mediciones el detector arranca a marcar outliers.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Anomalias detectadas
          </h2>
          <p className="text-xs text-muted-foreground">
            Peso, z-score sobre ventana movil de 14 dias
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {weightAnoms.length}
          </div>
          <div className="text-xs text-muted-foreground">en 30 dias</div>
        </div>
      </div>

      <div className="mt-4 h-56 w-full">
        <ParentSize>
          {({ width, height }) =>
            width < 10 ? null : (
              <AnomaliesChart
                width={width}
                height={height}
                points={points}
                anomalies={weightAnoms}
                now={now}
              />
            )
          }
        </ParentSize>
      </div>

      {weightAnoms.length > 0 ? (
        <ul className="mt-2 flex flex-col divide-y divide-border text-sm">
          {weightAnoms.slice(0, 4).map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: severityColor(a.severity) }}
                />
                <span className="text-muted-foreground">
                  {formatShortDate(new Date(a.detectedAt))}
                </span>
                <span>
                  {a.valueKg !== null ? `${a.valueKg.toFixed(1)} kg` : "--"}
                </span>
              </div>
              <div className="tabular-nums text-muted-foreground">
                severidad {severityLabel(a.severity)} (z {a.zScore.toFixed(2)})
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ChartProps = {
  width: number;
  height: number;
  points: WeightPoint[];
  anomalies: Anomaly[];
  now: Date;
};

function AnomaliesChart({
  width,
  height,
  points,
  anomalies,
  now,
}: ChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const innerW = Math.max(10, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(10, height - MARGIN.top - MARGIN.bottom);

  const to = now.getTime();
  const from = to - 30 * MS_IN_DAY;

  const inRange = points
    .map((p) => ({ t: new Date(p.recordedAt).getTime(), v: p.valueKg }))
    .filter((p) => p.t >= from && p.t <= to)
    .sort((a, b) => a.t - b.t);

  // si no hay suficientes puntos los anomalies pueden quedar fuera de rango,
  // calculo min/max sobre union de ambos para que todo entre.
  const allValues = [
    ...inRange.map((p) => p.v),
    ...anomalies.map((a) => a.valueKg as number),
  ];
  const minV = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxV = allValues.length > 0 ? Math.max(...allValues) : 1;
  const padV = (maxV - minV) * 0.15 || 1;

  const xScale = scaleTime<number>({
    domain: [from, to],
    range: [0, innerW],
  });
  const yScale = scaleLinear<number>({
    domain: [minV - padV, maxV + padV],
    range: [innerH, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} role="img" aria-label="Anomalias de peso">
      <Group left={MARGIN.left} top={MARGIN.top}>
        {inRange.length >= 2 ? (
          <LinePath
            data={inRange}
            x={(d) => xScale(d.t)}
            y={(d) => yScale(d.v)}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            className="text-muted-foreground"
            curve={curveMonotoneX}
          />
        ) : null}

        {inRange.map((p, i) => (
          <Circle
            key={`p-${i}`}
            cx={xScale(p.t)}
            cy={yScale(p.v)}
            r={2}
            className="fill-muted-foreground"
            opacity={0.6}
          />
        ))}

        {anomalies.map((a) => {
          const t = new Date(a.detectedAt).getTime();
          if (t < from || t > to || a.valueKg === null) return null;
          const active = hovered === null || hovered === a.id;
          return (
            <Circle
              key={a.id}
              cx={xScale(t)}
              cy={yScale(a.valueKg)}
              r={a.severity === "high" ? 6 : a.severity === "mid" ? 5 : 4}
              fill={severityColor(a.severity)}
              fillOpacity={active ? 0.9 : 0.3}
              stroke="var(--background)"
              strokeWidth={1.5}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <title>
                {`${formatShortDate(new Date(a.detectedAt))} - ${a.valueKg.toFixed(1)} kg (z ${a.zScore.toFixed(2)})`}
              </title>
            </Circle>
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
          tickFormat={(v) => `${(v as number).toFixed(0)}`}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          numTicks={Math.min(5, Math.floor(innerW / 80))}
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
          tickFormat={(d) => formatShortDate(new Date(d as number))}
        />
      </Group>
    </svg>
  );
}

function formatShortDate(d: Date): string {
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  return `${pad(day)}/${pad(month)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
