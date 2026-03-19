import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { regulationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = regulationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const regulation = await db.regulationNote.create({
    data: {
      ...parsed.data,
      slug: slugify(`${parsed.data.countryResearchId}-${parsed.data.requirementTitle}`),
    },
  });

  return NextResponse.json({ regulation });
}
