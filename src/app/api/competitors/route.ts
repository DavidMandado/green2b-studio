import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { competitorSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = competitorSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const competitor = await db.competitor.create({
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.name),
    },
  });

  return NextResponse.json({ competitor });
}
