import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const dataFilePath = path.join(process.cwd(), "data", "commute.json");

// Types for the mock API payload
export type WorkLocation = "office" | "home";
export type CommuteType = "car" | "public_transport";
export type CommuteEntry = {
  id: string;
  date: string; // dd-mm-yyyy
  workLocation?: WorkLocation;
  commuteType?: CommuteType;
  status?: "working" | "not_working";
};

export async function GET() {
  try {
    const content = await fs.readFile(dataFilePath, "utf8");
    const data = JSON.parse(content) as CommuteEntry[];
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}
