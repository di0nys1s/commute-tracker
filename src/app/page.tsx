"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSummary, type SummaryEntry } from "@/lib/summary-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type WorkLocation = "office" | "home";
export type CommuteType = "car" | "public_transport";

export type CommuteEntry = {
  id: string;
  date: string; // dd-mm-yyyy
  workLocation?: WorkLocation;
  commuteType?: CommuteType;
  status: "working" | "not_working";
};

function toDateInputValue(dateDdMmYyyy: string): string {
  const [dd, mm, yyyy] = dateDdMmYyyy.split("-");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInputValue(dateYyyyMmDd: string): string {
  const [yyyy, mm, dd] = dateYyyyMmDd.split("-");
  if (!dd || !mm || !yyyy) return "";
  return `${dd}-${mm}-${yyyy}`;
}

function getWeekdayShort(dateDdMmYyyy: string): string {
  const [dd, mm, yyyy] = dateDdMmYyyy.split("-");
  if (!dd || !mm || !yyyy) return "";
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function getTodayDdMmYyyy(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

function isWeekend(dateDdMmYyyy: string): boolean {
  const [dd, mm, yyyy] = dateDdMmYyyy.split("-");
  if (!dd || !mm || !yyyy) return false;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const day = d.getDay(); // 0 Sun, 6 Sat
  return day === 0 || day === 6;
}

function toMonthKey(dateDdMmYyyy: string): string {
  const parts = dateDdMmYyyy.split("-");
  const mm = parts[1];
  const yyyy = parts[2];
  if (!mm || !yyyy) return "";
  return `${mm}-${yyyy}`; // mm-yyyy
}

function monthKeyToLabel(monthKey: string): string {
  const [mm, yyyy] = monthKey.split("-");
  const m = Number(mm) - 1;
  if (Number.isNaN(m) || !yyyy) return monthKey;
  const dt = new Date(Number(yyyy), m, 1);
  return dt.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function daysInMonthFromKey(monthKey: string): number {
  const [mm, yyyy] = monthKey.split("-");
  const month = Number(mm);
  const year = Number(yyyy);
  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
    return 31;
  }
  return new Date(year, month, 0).getDate();
}

function makeDateFromMonthKeyDay(monthKey: string, day: number): string {
  const [mm, yyyy] = monthKey.split("-");
  const dd = String(day).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
}

export default function HomePage() {
  const [entries, setEntries] = useState<CommuteEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dirty-check logic removed per requirements
  const router = useRouter();
  const { setCurrentMonthDetails } = useSummary();

  const currentMonthKey = useMemo(() => toMonthKey(getTodayDdMmYyyy()), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const e of entries) {
      const k = toMonthKey(e.date);
      if (k) keys.add(k);
    }
    return Array.from(keys).sort((a, b) => {
      const [mmA, yyyyA] = a.split("-");
      const [mmB, yyyyB] = b.split("-");
      const yCmp = Number(yyyyA) - Number(yyyyB);
      if (yCmp !== 0) return yCmp;
      return Number(mmA) - Number(mmB);
    });
  }, [entries]);

  const filteredSortedEntries = useMemo(() => {
    const base =
      selectedMonth && selectedMonth.length
        ? entries.filter((e) => toMonthKey(e.date) === selectedMonth)
        : entries;
    const sorted = base
      .slice()
      .sort(
        (a, b) =>
          Number(a.date.split("-")[0] || 0) - Number(b.date.split("-")[0] || 0)
      );
    // Deduplicate by day-of-month to ensure max one row per day
    const seenDays = new Set<number>();
    const uniqueByDay: CommuteEntry[] = [];
    for (const item of sorted) {
      const dd = Number(item.date.split("-")[0] || 0);
      if (!seenDays.has(dd)) {
        seenDays.add(dd);
        uniqueByDay.push(item);
      }
    }
    const maxRows =
      selectedMonth && selectedMonth.length
        ? daysInMonthFromKey(selectedMonth)
        : uniqueByDay.length;
    return uniqueByDay.slice(0, maxRows);
  }, [entries, selectedMonth]);

  // Ensure the selected month always displays all days.
  useEffect(() => {
    if (!selectedMonth) return;
    const totalDays = daysInMonthFromKey(selectedMonth);
    const monthEntries = entries.filter(
      (e) => toMonthKey(e.date) === selectedMonth
    );
    const presentDays = new Set<number>(
      monthEntries.map((e) => Number(e.date.split("-")[0] || 0))
    );
    const missing: CommuteEntry[] = [];
    for (let day = 1; day <= totalDays; day++) {
      if (!presentDays.has(day)) {
        const date = makeDateFromMonthKeyDay(selectedMonth, day);
        missing.push({
          id: crypto.randomUUID(),
          date,
          workLocation: !isWeekend(date) ? "office" : undefined,
          commuteType: !isWeekend(date) ? "car" : undefined,
          status: !isWeekend(date) ? "working" : "not_working",
        });
      }
    }
    if (missing.length) {
      setEntries((prev) => [...prev, ...missing]);
    }
  }, [selectedMonth, entries]);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/commute", { cache: "no-store" });
        const json = await res.json();
        const raw = (json?.data ?? []) as Partial<CommuteEntry>[];
        // Ensure unique ids
        const seenIds = new Set<string>();
        const makeId = (candidate?: string): string => {
          let id = (candidate ?? "").toString().trim();
          if (!id) id = crypto.randomUUID();
          while (seenIds.has(id)) id = crypto.randomUUID();
          seenIds.add(id);
          return id;
        };
        // Remove the above data when there is unique ids
        const normalized: CommuteEntry[] = raw.map((e) => {
          const date = e.date ?? getTodayDdMmYyyy();
          const computedStatus: "working" | "not_working" =
            (e.status as "working" | "not_working") ??
            (!isWeekend(date) ? "working" : "not_working");
          return {
            id: makeId(e.id as string | undefined),
            date,
            workLocation:
              computedStatus === "working"
                ? (e.workLocation as WorkLocation) ?? "office"
                : undefined,
            commuteType:
              computedStatus === "working"
                ? (e.commuteType as CommuteType) ?? "car"
                : undefined,
            status: computedStatus,
          };
        });
        setEntries(normalized);
        // After loading, default to the latest month present in data
        const monthKeys = Array.from(
          new Set(normalized.map((e) => toMonthKey(e.date)).filter(Boolean))
        );
        if (monthKeys.length) {
          const latest = monthKeys.sort((a, b) => {
            const [mmA, yyyyA] = a.split("-");
            const [mmB, yyyyB] = b.split("-");
            const yCmp = Number(yyyyA) - Number(yyyyB);
            if (yCmp !== 0) return yCmp;
            return Number(mmA) - Number(mmB);
          })[monthKeys.length - 1];
          setSelectedMonth(latest);
        }
      } catch (e) {
        setError("Failed to load data");
      }
    }
    load();
  }, []);

  function updateEntry(id: string, patch: Partial<CommuteEntry>) {
    setEntries((prev) => {
      const index = prev.findIndex((e) => e.id === id);
      if (index === -1) return prev;
      const next = prev.slice();
      next[index] = { ...prev[index], ...patch };
      return next;
    });
  }

  // addRow removed per requirements

  async function saveAll() {
    try {
      setIsSaving(true);
      setError(null);
      const monthEntries =
        selectedMonth && selectedMonth.length
          ? entries
              .filter((e) => toMonthKey(e.date) === selectedMonth)
              .slice()
              .sort(
                (a, b) =>
                  Number(a.date.split("-")[0] || 0) -
                  Number(b.date.split("-")[0] || 0)
              )
          : entries.slice();
      const normalizedForSummary: SummaryEntry[] = monthEntries.map((e) => ({
        id: e.id,
        date: e.date,
        workLocation: e.workLocation ?? "",
        commuteType: e.commuteType ?? "",
        status: e.status,
      }));
      setCurrentMonthDetails(normalizedForSummary);
      router.push("/summary");
    } catch (e) {
      setError("Failed to prepare summary");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-dvh bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Commute Tracker
            </h1>
            <p className="text-sm text-neutral-500">
              Edit your daily work and commute details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Month</span>
              <Select
                value={selectedMonth}
                onValueChange={(value: string) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((k) => (
                    <SelectItem key={k} value={k}>
                      {monthKeyToLabel(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveAll} disabled={isSaving || !entries.length}>
              {isSaving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
              {filteredSortedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Input
                      type="date"
                      value={toDateInputValue(entry.date)}
                      readOnly
                      disabled
                    />
                  </TableCell>
                  <TableCell>{getWeekdayShort(entry.date)}</TableCell>
                  <TableCell>
                    <Select
                      value={entry.status}
                      onValueChange={(value: "working" | "not_working") =>
                        updateEntry(entry.id, {
                          status: value,
                          // When switching to not_working, clear fields; when switching to working, set defaults if missing
                          workLocation:
                            value === "not_working"
                              ? undefined
                              : entry.workLocation ?? "office",
                          commuteType:
                            value === "not_working"
                              ? undefined
                              : entry.commuteType ?? "car",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="not_working">Not Working</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {entry.status === "not_working" ? (
                      <div>-</div>
                    ) : (
                      <Select
                        {...(entry.workLocation
                          ? { value: entry.workLocation }
                          : {})}
                        onValueChange={(value: WorkLocation) =>
                          updateEntry(entry.id, { workLocation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.status === "not_working" ? (
                      <div>-</div>
                    ) : (
                      <Select
                        {...(entry.commuteType
                          ? { value: entry.commuteType }
                          : {})}
                        onValueChange={(value: CommuteType) =>
                          updateEntry(entry.id, { commuteType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="public_transport">
                            Public Transport
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!filteredSortedEntries.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-10 text-center text-sm text-neutral-500">
                      No entries for the selected month.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dirty-check footer removed */}
      </div>
    </main>
  );
}
