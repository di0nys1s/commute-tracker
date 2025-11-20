"use client";

import { useSummary } from "@/lib/summary-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

function getWeekdayShort(dateDdMmYyyy: string): string {
  const [dd, mm, yyyy] = dateDdMmYyyy.split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export default function SummaryPage() {
  const { currentMonthDetails } = useSummary();
  const router = useRouter();

  const rows = useMemo(
    () =>
      currentMonthDetails
        .slice()
        .sort(
          (a, b) =>
            Number(a.date.split("-")[0] || 0) -
            Number(b.date.split("-")[0] || 0)
        ),
    [currentMonthDetails]
  );

  const onSubmit = () => {
    console.log("Submitting currentMonthDetails:", rows);
  };

  useEffect(() => {
    if (!currentMonthDetails.length) {
      router.replace("/");
    }
  }, [currentMonthDetails, router]);

  return (
    <main className="min-h-dvh bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Summary</h1>
            <p className="text-sm text-neutral-500">
              Read-only view of the saved month data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button onClick={onSubmit}>Submit</Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/60">
                <TableHead className="w-[220px]">Date</TableHead>
                <TableHead className="w-[120px]">Day</TableHead>
                <TableHead className="w-[180px]">Status</TableHead>
                <TableHead className="w-[220px]">Work Location</TableHead>
                <TableHead className="w-[240px]">Commute Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{getWeekdayShort(entry.date)}</TableCell>
                  <TableCell>
                    {entry.status === "working" ? "Working" : "Not Working"}
                  </TableCell>
                  <TableCell>
                    {!entry.workLocation
                      ? "-"
                      : entry.workLocation === "office"
                      ? "Office"
                      : "Home"}
                  </TableCell>
                  <TableCell>
                    {!entry.commuteType
                      ? "-"
                      : entry.commuteType === "car"
                      ? "Car"
                      : "Public Transport"}
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-10 text-center text-sm text-neutral-500">
                      No data available.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
