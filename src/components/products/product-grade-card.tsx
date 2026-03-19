import Link from "next/link";

import type { ScoredProductRecord } from "@/lib/insights";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PRODUCT_CATEGORY_LABELS, SCORE_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ProductGradeCard({
  product,
  categoryAverage,
}: {
  product: ScoredProductRecord;
  categoryAverage?: number;
}) {
  const delta = categoryAverage ? product.score.finalScore - categoryAverage : 0;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
        <div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium muted-copy">{PRODUCT_CATEGORY_LABELS[product.category]}</p>
              <Link href={`/products/${product.id}`} className="mt-1 block text-xl font-semibold hover:text-[var(--accent)]">
                {product.productName}
              </Link>
            </div>
            <Badge variant={product.score.grade === "A" ? "success" : product.score.grade === "B" ? "info" : product.score.grade === "C" ? "warning" : "danger"}>
              Grade {product.score.grade}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-[var(--card-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Final Score</p>
              <p className="mt-2 text-2xl font-semibold">{formatNumber(product.score.finalScore, 1)}</p>
            </div>
            <div className="rounded-3xl bg-[var(--card-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Price</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(product.unitPriceEur)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm muted-copy">{SCORE_STATUS_LABELS[product.score.status as keyof typeof SCORE_STATUS_LABELS]}</p>
          <p className="text-sm">
            <span className="font-semibold">Strengths:</span> {product.score.topReasons.slice(0, 2).join("; ")}.
          </p>
          <p className="text-sm">
            <span className="font-semibold">Weaknesses:</span>{" "}
            {product.score.missingInputs.length ? product.score.missingInputs.slice(0, 2).join("; ") : "Limited weaknesses flagged in the current prototype."}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Proof quality:</span> {formatNumber(product.score.confidenceScore, 0)}/100
          </p>
          {categoryAverage ? (
            <p className="text-sm muted-copy">
              {delta >= 0 ? "+" : ""}
              {formatNumber(delta, 1)} versus category average
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
