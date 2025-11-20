import { NextResponse } from "next/server";
import { spawn } from "node:child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // We accept the body for parity but do not persist any files on disk.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _body = (await request.json()) as { data: unknown };

    // Run with npx as requested and return a brief summary when finished.
    const bin = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(
      bin,
      ["playwright", "test", "--headed", "--reporter=list"],
      {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });

    const exitCode: number = await new Promise((resolve) => {
      child.on("close", (code) => resolve(code ?? 0));
    });

    const tail = (s: string, n = 1200) =>
      s.length > n ? s.slice(s.length - n) : s;

    return NextResponse.json(
      { ok: exitCode === 0, exitCode, output: tail(stdout || stderr) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
