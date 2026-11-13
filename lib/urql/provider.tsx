"use client";

import { useMemo, type ReactNode } from "react";
import { Provider } from "urql";

import { getBrowserClient } from "./client";

type UrqlProviderProps = {
  initialState?: unknown;
  children: ReactNode;
};

export function UrqlProvider({ initialState, children }: UrqlProviderProps) {
  const { client } = useMemo(
    () => getBrowserClient(initialState),
    [initialState],
  );
  return <Provider value={client}>{children}</Provider>;
}
