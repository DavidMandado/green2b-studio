import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { regulationSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = regulationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const regulation = await db.regulationNote.update({
    where: { id },
    data: {
      ...parsed.data,
      slug: slugify(`${parsed.data.countryResearchId}-${parsed.data.requirementTitle}`),
    },
  });

  return NextResponse.json({ regulation });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.regulationNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
