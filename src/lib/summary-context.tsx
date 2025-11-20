"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type SummaryEntry = {
  id: string;
  date: string; // dd-mm-yyyy
  workLocation: string; // empty string when not provided
  commuteType?: string; // empty string when not provided
  status?: "working" | "not_working";
};

type SummaryContextValue = {
  currentMonthDetails: SummaryEntry[];
  setCurrentMonthDetails: (entries: SummaryEntry[]) => void;
};

const SummaryContext = createContext<SummaryContextValue | null>(null);

export function SummaryProvider({ children }: { children: React.ReactNode }) {
  const [currentMonthDetails, setCurrentMonthDetails] = useState<
    SummaryEntry[]
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
