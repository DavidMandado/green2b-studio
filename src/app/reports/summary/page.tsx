import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/server/queries";

export default async function SummaryReportPage() {
  const data = await getDashboardData();
  const topProducts = [...data.scoredProducts].sort((left, right) => right.score.finalScore - left.score.finalScore).slice(0, 5);
  const topSuppliers = [...data.suppliers].sort((left, right) => right.evidenceCompletenessScore - left.evidenceCompletenessScore).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Consulting Handover"
        title="Green2B Studio summary report"
        description="Print-friendly handover covering market focus, buyer pain points, supplier and product readiness, and the grading framework."
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recommended focus market</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">{data.focusCountry?.country.name}</p>
            <p className="leading-7">{data.focusCountry?.country.recommendationSummary}</p>
            <p className="text-sm muted-copy">
              Why first: high sustainability maturity, strong horeca density, manageable pilot scope, and simpler initial logistics than Germany or the UK.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top buyer pain points</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.interviewInsights.topPainPoints.map((pain) => (
              <div key={pain} className="rounded-3xl bg-white p-4">
                {pain}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Competitor gap</CardTitle></CardHeader>
          <CardContent><p className="leading-7">{data.competitorWedge}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top suppliers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topSuppliers.map((supplier) => (
              <div key={supplier.id} className="rounded-3xl bg-white p-4">
                <p className="font-semibold">{supplier.name}</p>
                <p className="text-sm muted-copy">Evidence completeness {supplier.evidenceCompletenessScore}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Grading framework</CardTitle></CardHeader>
          <CardContent>
            <p className="leading-7">
              The framework combines seven weighted pillars with a confidence adjustment, then subtracts capped missing-data penalties. This lets Green2B show both sustainability promise and proof quality in the same output.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Top 5 products by score</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-start justify-between gap-4 rounded-3xl bg-white p-4">
                <div>
                  <p className="font-semibold">
                    {index + 1}. {product.productName}
                  </p>
                  <p className="text-sm muted-copy">{product.supplier.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{product.score.grade}</p>
                  <p className="text-sm muted-copy">{product.score.finalScore}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recommended next actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              "Pilot Netherlands cafés and office catering.",
              "Standardize supplier data request templates.",
              "Improve evidence completeness for the three best products.",
              "Test the buyer-facing comparison sheet with founders and pilot buyers.",
            ].map((step, index) => (
              <div key={step} className="rounded-3xl bg-white p-4">
                <p className="font-semibold">{index + 1}. {step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
