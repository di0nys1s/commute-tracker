import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const dataFilePath = path.join(process.cwd(), "data", "commute.json");

type WorkLocation = "office" | "home";
type CommuteType = "car" | "public_transport";

export type CommuteEntry = {
  id: string;
  date: string; // dd-mm-yyyy
  workLocation: WorkLocation;
  commuteType: CommuteType;
};

async function readData(): Promise<CommuteEntry[]> {
  const content = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(content);
}

async function writeData(entries: CommuteEntry[]): Promise<void> {
  const content = JSON.stringify(entries, null, 2) + "\n";
  await fs.writeFile(dataFilePath, content, "utf8");
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { data: CommuteEntry[] };
    if (!Array.isArray(body?.data)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }
    await writeData(body.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to write data" },
      { status: 500 }
    );
  }
}
