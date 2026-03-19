import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { interviewSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = interviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await db.buyerInterview.update({
    where: { id },
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.companyName),
    },
  });

  return NextResponse.json({ interview });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.buyerInterview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
