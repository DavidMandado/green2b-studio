import { notFound } from "next/navigation";

import { MissingDataWarningPanel } from "@/components/products/missing-data-warning-panel";
import { ProductGradeCard } from "@/components/products/product-grade-card";
import { ScoreBreakdownPanel } from "@/components/products/score-breakdown-panel";
import { PageHeader } from "@/components/shared/page-header";
import { EvidenceBadgeList } from "@/components/shared/evidence-badge-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getProductsWithScores } from "@/lib/server/queries";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProductsWithScores();
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const categoryAverage =
    products
      .filter((item) => item.category === product.category)
      .reduce((sum, item) => sum + item.score.finalScore, 0) /
    products.filter((item) => item.category === product.category).length;

  return (
    <>
      <PageHeader
        eyebrow="Product Detail"
        title={product.productName}
        description={`${product.supplier.name} · ${product.materialDescription}`}
        badge={`Grade ${product.score.grade}`}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <ProductGradeCard product={product} categoryAverage={categoryAverage} />
        <Card>
          <CardHeader>
            <CardTitle>Commercial and disclosure details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Price", formatCurrency(product.unitPriceEur)],
              ["MOQ", product.minimumOrderQuantity],
              ["Lead time", `${product.leadTimeDays} days`],
              ["Transport", product.transportMode ?? "Unknown"],
              ["Distance", product.distanceKm ?? "Unknown"],
              ["Traceability", product.traceabilityScore ?? "Unknown"],
              ["Supplier disclosure", product.supplierDisclosureScore ?? "Unknown"],
              ["Labor policy", product.laborPolicyScore ?? "Unknown"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-3xl bg-[var(--card-strong)] p-4">
                <p className="text-sm muted-copy">{label}</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-[var(--card-strong)] p-4 sm:col-span-2">
              <p className="text-sm muted-copy">Evidence status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="info">{product.evidenceStatus}</Badge>
                <Badge>{product.score.status.toLowerCase().replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-3 text-sm muted-copy">{product.notes}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <ScoreBreakdownPanel score={product.score} />

      <section className="grid gap-6 xl:grid-cols-2">
        <MissingDataWarningPanel items={product.score.missingInputs} />
        <Card>
          <CardHeader>
            <CardTitle>Evidence and proof quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EvidenceBadgeList evidence={[...product.evidence, ...product.supplierEvidence]} />
            <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <p className="font-semibold">Top reasons for the score</p>
              <ul className="mt-3 space-y-2 text-sm">
                {product.score.topReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
