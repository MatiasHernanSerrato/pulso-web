import { gql } from "@/lib/api";

export type Anomaly = {
  id: string;
  detectedAt: string;
  // en el backend tenemos solo peso por ahora; dejo el campo para que
  // despues se extienda a gastos sin romper el schema del front.
  metric: "weight" | "spend";
  valueKg: number | null;
  zScore: number;
  severity: "low" | "mid" | "high";
};

export type AnomaliesInRangeQuery = {
  anomaliesInRange: Anomaly[];
};

const ANOMALIES_IN_RANGE = /* GraphQL */ `
  query AnomaliesInRange($from: Time!, $to: Time!) {
    anomaliesInRange(from: $from, to: $to) {
      id
      detectedAt
      metric
      valueKg
      zScore
      severity
    }
  }
`;

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export async function fetchAnomaliesLast30Days(
  token: string,
  now: Date = new Date(),
): Promise<Anomaly[]> {
  const to = now;
  const from = new Date(to.getTime() - 30 * MS_IN_DAY);
  const data = await gql<AnomaliesInRangeQuery>(
    ANOMALIES_IN_RANGE,
    { from: from.toISOString(), to: to.toISOString() },
    token,
  );
  // vienen ordenadas por fecha desc desde el backend, pero no me quiero
  // confiar (los tests de integration a veces las devuelven asc).
  return [...data.anomaliesInRange].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
  );
}

export function severityColor(sev: Anomaly["severity"]): string {
  switch (sev) {
    case "high":
      return "#dc2626";
    case "mid":
      return "#ea580c";
    case "low":
    default:
      return "#ca8a04";
  }
}

export function severityLabel(sev: Anomaly["severity"]): string {
  switch (sev) {
    case "high":
      return "alta";
    case "mid":
      return "media";
    case "low":
    default:
      return "leve";
  }
}
