import { getDatabase } from "./mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import type { CommuteEntry } from "@/app/api/commute/route";

const dataFilePath = path.join(process.cwd(), "data", "commute.json");

export async function seedDatabase() {
  try {
    const db = await getDatabase();
    const collection = db.collection<CommuteEntry>("commuteEntries");

    // Check if database already has data
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    // Read commute.json
    const content = await fs.readFile(dataFilePath, "utf8");
    const entries = JSON.parse(content) as Array<{
      id: string;
      date: string;
      workLocation?: string;
    }>;

    // Add user field to each entry and convert to CommuteEntry format
    const entriesWithUser: Omit<CommuteEntry, "id">[] = entries.map((entry) => ({
      date: entry.date,
      workLocation: entry.workLocation as "office" | "home" | undefined,
      user: "test@rtl.nl",
    }));

    // Insert into MongoDB
    await collection.insertMany(entriesWithUser as any);
    console.log(`Seeded ${entriesWithUser.length} entries to database`);
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}

