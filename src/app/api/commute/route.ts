import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import "@/lib/init-db"; // Initialize database on app start

export const dynamic = "force-dynamic";

// Types for the mock API payload
export type WorkLocation = "office" | "home";
export type CommuteType = "car" | "public_transport";

// Model for GET API response
export type CommuteEntry = {
  id: string;
  date: string; // dd-mm-yyyy
  workLocation?: WorkLocation;
  commuteType?: CommuteType;
  status?: "working" | "not_working";
  user?: string; // email address
};

// Model for POST API request/processing
type CommutePostEntry = {
  user?: string;
  wifi?: string;
};

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection<CommuteEntry>("commuteEntries");
    
    const entries = await collection.find({}).toArray();
    
    // Map MongoDB documents to CommuteEntry format
    // MongoDB _id needs to be converted to string id
    const allEntries: CommuteEntry[] = entries.map((entry: any) => ({
      id: entry._id?.toString() || entry.id || "",
      date: entry.date,
      workLocation: entry.workLocation,
      commuteType: entry.commuteType,
      status: entry.status,
      user: entry.user,
    }));
    
    // Group by date and return 1 record per day
    // Office overrides home if both exist for the same day
    const entriesByDate = new Map<string, CommuteEntry>();
    
    for (const entry of allEntries) {
      const existing = entriesByDate.get(entry.date);
      
      if (!existing) {
        // No entry for this date yet, add it
        entriesByDate.set(entry.date, entry);
      } else {
        // Entry exists for this date
        // If new entry is "office" and existing is "home", replace it
        // If new entry is "home" and existing is "office", keep existing
        if (entry.workLocation === "office" && existing.workLocation === "home") {
          entriesByDate.set(entry.date, entry);
        }
        // Otherwise keep the existing entry (office stays office, home stays home if no office)
      }
    }
    
    // Convert map to array and sort by date
    const data = Array.from(entriesByDate.values()).sort((a, b) => {
      // Sort by date (dd-mm-yyyy format)
      const [ddA, mmA, yyyyA] = a.date.split("-").map(Number);
      const [ddB, mmB, yyyyB] = b.date.split("-").map(Number);
      
      if (yyyyA !== yyyyB) return yyyyA - yyyyB;
      if (mmA !== mmB) return mmA - mmB;
      return ddA - ddB;
    });
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to read data:", error);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CommutePostEntry;
    
    if (!body) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Parse JSON to CommutePostEntry
    const postEntry: CommutePostEntry = {
      user: body.user,
      wifi: body.wifi,
    };

    // Map CommutePostEntry to CommuteEntry
    // Determine workLocation based on wifi prefix
    // If wifi starts with "RTL" or "DPG", workLocation is "office", otherwise "home"
    const workLocation: WorkLocation = 
      postEntry.wifi && (postEntry.wifi.startsWith("RTL") || postEntry.wifi.startsWith("DPG"))
        ? "office"
        : "home";

    // Get today's date in dd-mm-yyyy format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const date = `${dd}-${mm}-${yyyy}`;

    // Map to CommuteEntry (without id, MongoDB will auto-generate)
    const entry: Omit<CommuteEntry, "id"> = {
      date,
      workLocation,
      user: postEntry.user, // Save user (email) but not wifi
    };

    // Get MongoDB connection and save
    const db = await getDatabase();
    const collection = db.collection<CommuteEntry>("commuteEntries");
    const result = await collection.insertOne(entry as any);
    
    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error("Failed to process data:", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
}