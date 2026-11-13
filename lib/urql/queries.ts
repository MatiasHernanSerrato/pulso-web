import { gql as urqlGql } from "urql";

// Centralizamos las queries para que el codegen (cuando lo pongamos) las agarre
// desde un solo lugar.

export const ME_QUERY = urqlGql`
  query Me {
    me {
      id
      email
    }
  }
`;

export const WEIGHTS_IN_RANGE_QUERY = urqlGql`
  query WeightsInRange($from: Time!, $to: Time!) {
    weightsInRange(from: $from, to: $to) {
      recordedAt
      valueKg
    }
  }
`;

export const EXPENSES_BY_CATEGORY_QUERY = urqlGql`
  query ExpensesByCategory($from: Time!, $to: Time!) {
    expensesByCategory(from: $from, to: $to) {
      category
      totalCents
      count
    }
  }
`;

export const RECENT_ANOMALIES_QUERY = urqlGql`
  query RecentAnomalies($limit: Int!) {
    recentAnomalies(limit: $limit) {
      id
      kind
      detectedAt
      zScore
      message
    }
  }
`;
