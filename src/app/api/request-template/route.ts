import { NextResponse } from "next/server";
import { z } from "zod";

import { REQUEST_TEMPLATES } from "@/lib/request-templates";

const schema = z.object({
  category: z.enum([
    "STRAWS",
    "TAKEAWAY_CUPS",
    "BOWLS",
    "CUTLERY",
    "LIDS",
    "NAPKINS",
    "FOOD_CONTAINERS",
  ]),
  format: z.enum(["json", "csv"]).default("json"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({
    category: searchParams.get("category"),
    format: searchParams.get("format") ?? "json",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const template = REQUEST_TEMPLATES[parsed.data.category];
  if (parsed.data.format === "json") {
    return NextResponse.json(template);
  }

  const csv = ["item", ...template.checklist].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${parsed.data.category.toLowerCase()}-request-template.csv"`,
    },
  });
}
