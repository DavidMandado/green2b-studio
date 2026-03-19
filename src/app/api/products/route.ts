import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      ...parsed.data,
      distanceKm: parsed.data.distanceKm === null ? null : Math.round(parsed.data.distanceKm),
      slug: slugify(parsed.data.productName),
    },
  });

  return NextResponse.json({ product });
}
