import { seedDatabase } from "./seed-db";

// Initialize database on app start
let initPromise: Promise<void> | null = null;

export function initializeDatabase() {
  if (!initPromise) {
    initPromise = seedDatabase().catch((err) => {
      console.error("Database initialization failed:", err);
      initPromise = null; // Reset on error
    });
  }
  return initPromise;
}

// Auto-initialize when module is imported
if (typeof window === "undefined") {
  // Only run on server side
  initializeDatabase();
}

