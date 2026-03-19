import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { supplierSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = supplierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supplier = await db.supplier.update({
    where: { id },
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.name),
    },
  });

  return NextResponse.json({ supplier });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.supplier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
