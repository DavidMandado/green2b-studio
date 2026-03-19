"use client";

import type { ProductCategory } from "@prisma/client";
import { useMemo, useState } from "react";

import { ProductGradeCard } from "@/components/products/product-grade-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ScoredProductRecord } from "@/lib/insights";

type SortKey = "grade" | "price" | "confidence" | "material";

export function CompareView({
  products,
  categoryAverages,
}: {
  products: ScoredProductRecord[];
  categoryAverages: Record<string, number>;
}) {
  const [category, setCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("grade");

  const filtered = useMemo(() => {
    const subset = category === "ALL" ? products : products.filter((product) => product.category === category);
    return [...subset].sort((left, right) => {
      switch (sortBy) {
        case "price":
          return left.unitPriceEur - right.unitPriceEur;
        case "confidence":
          return right.score.confidenceScore - left.score.confidenceScore;
        case "material":
          return right.score.pillars.material.score - left.score.pillars.material.score;
        case "grade":
        default:
          return right.score.finalScore - left.score.finalScore;
      }
    });
  }, [category, products, sortBy]);

  const bestSustainability = filtered[0];
  const bestValue = [...filtered].sort(
    (left, right) =>
      right.score.finalScore / Math.max(right.unitPriceEur, 0.001) -
      left.score.finalScore / Math.max(left.unitPriceEur, 0.001),
  )[0];
  const bestVerified = filtered
    .filter((product) => product.score.status === "VERIFIED")
    .sort((left, right) => right.score.finalScore - left.score.finalScore)[0];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Buyer-facing comparison</CardTitle>
            <p className="mt-2 text-sm muted-copy">Filter by category and sort by commercial or sustainability signals.</p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <Select value={category} onChange={(event) => setCategory(event.target.value as "ALL" | ProductCategory)}>
              <option value="ALL">All categories</option>
              {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)}>
              <option value="grade">Sort by grade</option>
              <option value="price">Sort by price</option>
              <option value="confidence">Sort by confidence</option>
              <option value="material">Sort by material score</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {bestValue ? (
            <div className="rounded-3xl bg-white p-4">
              <Badge variant="success">Best Value</Badge>
              <p className="mt-3 font-semibold">{bestValue.productName}</p>
              <p className="text-sm muted-copy">Strong score relative to price.</p>
            </div>
          ) : null}
          {bestSustainability ? (
            <div className="rounded-3xl bg-white p-4">
              <Badge variant="info">Best Sustainability</Badge>
              <p className="mt-3 font-semibold">{bestSustainability.productName}</p>
              <p className="text-sm muted-copy">Highest final score in the current selection.</p>
            </div>
          ) : null}
          {bestVerified ? (
            <div className="rounded-3xl bg-white p-4">
              <Badge variant="neutral">Best Verified Option</Badge>
              <p className="mt-3 font-semibold">{bestVerified.productName}</p>
              <p className="text-sm muted-copy">Best-performing product with verified status.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {filtered.map((product) => (
          <div key={product.id} className="relative">
            {bestValue?.id === product.id ? (
              <Badge className="absolute left-5 top-5 z-10" variant="success">
                Best value
              </Badge>
            ) : null}
            {bestSustainability?.id === product.id ? (
              <Badge className="absolute left-5 top-5 z-10" variant="info">
                Best sustainability
              </Badge>
            ) : null}
            {bestVerified?.id === product.id ? (
              <Badge className="absolute left-5 top-5 z-10" variant="neutral">
                Best verified
              </Badge>
            ) : null}
            <ProductGradeCard product={product} categoryAverage={categoryAverages[product.category]} />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => window.open("/api/products/export", "_blank")}>
          Export current product dataset as CSV
        </Button>
      </div>
    </div>
  );
}
