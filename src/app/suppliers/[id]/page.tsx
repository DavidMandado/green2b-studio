import { notFound } from "next/navigation";

import { ProductGradeCard } from "@/components/products/product-grade-card";
import { PageHeader } from "@/components/shared/page-header";
import { EvidenceBadgeList } from "@/components/shared/evidence-badge-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_STAGE_LABELS } from "@/lib/constants";
import { getProductsWithScores, getSupplierById } from "@/lib/server/queries";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supplier, products] = await Promise.all([getSupplierById(id), getProductsWithScores()]);

  if (!supplier) {
    notFound();
  }

  const relatedProducts = products.filter((product) => product.supplierId === supplier.id);
  const missingDocs = supplier.evidence.filter((item) => item.verificationStatus !== "VERIFIED");

  return (
    <>
      <PageHeader
        eyebrow="Supplier Detail"
        title={supplier.name}
        description={supplier.notes}
        badge={CONTACT_STAGE_LABELS[supplier.contactStage]}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Supplier profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-[var(--card-strong)] p-4">
                <p className="text-sm muted-copy">Location</p>
                <p className="mt-1 text-xl font-semibold">
                  {supplier.city}, {supplier.country}
                </p>
              </div>
              <div className="rounded-3xl bg-[var(--card-strong)] p-4">
                <p className="text-sm muted-copy">Evidence completeness</p>
                <p className="mt-1 text-xl font-semibold">{supplier.evidenceCompletenessScore}</p>
              </div>
              <div className="rounded-3xl bg-[var(--card-strong)] p-4">
                <p className="text-sm muted-copy">Reliability</p>
                <p className="mt-1 text-xl font-semibold">{supplier.reliabilityRating}</p>
              </div>
              <div className="rounded-3xl bg-[var(--card-strong)] p-4">
                <p className="text-sm muted-copy">B Corp</p>
                <p className="mt-1 text-xl font-semibold">{supplier.bcorpCertified ? "Yes" : "No"}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div>
                <p className="text-sm font-semibold">Primary materials</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {((supplier.primaryMaterials as string[]) ?? []).map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Certifications</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {((supplier.otherCertifications as string[]) ?? []).map((item) => (
                    <Badge key={item} variant="info">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Risk flags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {((supplier.riskFlags as string[]) ?? []).map((item) => (
                    <Badge key={item} variant="warning">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EvidenceBadgeList evidence={supplier.evidence} />
            <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <p className="font-semibold">Missing or ageing documents</p>
              <div className="mt-3 space-y-2">
                {missingDocs.length ? (
                  missingDocs.map((item) => (
                    <div key={item.id} className="text-sm">
                      {item.title} · {item.verificationStatus.toLowerCase().replaceAll("_", " ")}
                    </div>
                  ))
                ) : (
                  <p className="text-sm muted-copy">No immediate evidence issues flagged.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {relatedProducts.map((product) => (
          <ProductGradeCard key={product.id} product={product} />
        ))}
      </section>
    </>
  );
}
