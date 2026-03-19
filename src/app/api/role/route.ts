import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const schema = z.object({
  role: z.enum(["ANALYST", "FOUNDER", "BUYER_DEMO"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role payload" }, { status: 400 });
  }

  await db.appState.upsert({
    where: { id: 1 },
    update: { activeRole: parsed.data.role },
    create: { id: 1, activeRole: parsed.data.role },
  });

  return NextResponse.json({ ok: true });
}
