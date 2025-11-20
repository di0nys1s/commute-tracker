"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  workLocation: WorkLocation;
  commuteType: CommuteType;
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

function getTodayDdMmYyyy(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export default function HomePage() {
  const [entries, setEntries] = useState<CommuteEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep original for dirty check
  const originalRef = useRef<CommuteEntry[]>([]);

  const isDirty = useMemo(
    () => JSON.stringify(entries) !== JSON.stringify(originalRef.current),
    [entries]
  );

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/commute", { cache: "no-store" });
        const json = await res.json();
        const data = (json?.data ?? []) as CommuteEntry[];
        setEntries(data);
        originalRef.current = data;
      } catch (e) {
        setError("Failed to load data");
      }
    }
    load();
  }, [originalRef]);

  function updateEntry(id: string, patch: Partial<CommuteEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }

  function addRow() {
    const newEntry: CommuteEntry = {
      id: crypto.randomUUID(),
      date: getTodayDdMmYyyy(),
      workLocation: "office",
      commuteType: "car",
    };
    setEntries((prev) => [newEntry, ...prev]);
  }

  function removeRow(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function saveAll() {
    try {
      setIsSaving(true);
      setError(null);
      const res = await fetch("/api/commute", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: entries }),
      });
      if (!res.ok) throw new Error("Save failed");
      originalRef.current = entries;
    } catch (e) {
      setError("Failed to save changes");
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
            <Button variant="secondary" onClick={addRow}>
              Add Row
            </Button>
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
                <TableHead className="w-[220px]">Date (dd-mm-yyyy)</TableHead>
                <TableHead className="w-[220px]">Work Location</TableHead>
                <TableHead className="w-[240px]">Commute Type</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Input
                      type="date"
                      value={toDateInputValue(entry.date)}
                      onChange={(e) =>
                        updateEntry(entry.id, {
                          date: fromDateInputValue(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={entry.workLocation}
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
                  </TableCell>
                  <TableCell>
                    <Select
                      value={entry.commuteType}
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
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeRow(entry.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!entries.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-10 text-center text-sm text-neutral-500">
                      No entries. Click &quot;Add Row&quot; to create one.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 text-xs text-neutral-500">
          {isDirty ? "You have unsaved changes." : "All changes saved."}
        </div>
      </div>
    </main>
  );
}
