import type { Metadata } from "next";
import "./globals.css";
import { SummaryProvider } from "@/lib/summary-context";

export const metadata: Metadata = {
  title: "Commute Tracker",
  description: "Track your daily commute",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SummaryProvider>{children}</SummaryProvider>
      </body>
    </html>
  );
}
