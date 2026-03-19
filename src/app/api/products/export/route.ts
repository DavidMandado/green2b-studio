import { NextResponse } from "next/server";

import { getProductsWithScores } from "@/lib/server/queries";

function toCsv(rows: Record<string, string | number>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...body].join("\n");
}

export async function GET() {
  const products = await getProductsWithScores();
  const csv = toCsv(
    products.map((product) => ({
      product: product.productName,
      supplier: product.supplier.name,
      category: product.category,
      grade: product.score.grade,
      finalScore: product.score.finalScore,
      confidence: product.score.confidenceScore,
      priceEur: product.unitPriceEur,
      status: product.score.status,
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="green2b-products.csv"',
    },
  });
}
