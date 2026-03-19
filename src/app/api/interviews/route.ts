import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { interviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = interviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await db.buyerInterview.create({
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.companyName),
    },
  });

  return NextResponse.json({ interview });
}
