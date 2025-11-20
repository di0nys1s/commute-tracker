"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { CommuteEntry } from "@/app/page";

type SummaryContextValue = {
  currentMonthDetails: CommuteEntry[];
  setCurrentMonthDetails: (entries: CommuteEntry[]) => void;
};

const SummaryContext = createContext<SummaryContextValue | null>(null);

export function SummaryProvider({ children }: { children: React.ReactNode }) {
  const [currentMonthDetails, setCurrentMonthDetails] = useState<
    CommuteEntry[]
  >([]);

  const value = useMemo(
    () => ({ currentMonthDetails, setCurrentMonthDetails }),
    [currentMonthDetails]
  );

  return (
    <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>
  );
}

export function useSummary(): SummaryContextValue {
  const ctx = useContext(SummaryContext);
  if (!ctx) {
    throw new Error("useSummary must be used within a SummaryProvider");
  }
  return ctx;
}
