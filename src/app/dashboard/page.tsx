import { AlertTriangle, CheckCircle2, Globe2, Lightbulb, TrendingUp } from "lucide-react";

import { BarChartCard } from "@/components/charts/bar-chart-card";
import { CountryRadarCard } from "@/components/charts/country-radar-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { getDashboardData } from "@/lib/server/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const focusCountry = data.focusCountry?.country;
  const averageScore =
    data.scoredProducts.reduce((sum, product) => sum + product.score.finalScore, 0) /
    Math.max(data.scoredProducts.length, 1);
  const provisionalCount = data.scoredProducts.filter((product) => product.score.status === "PROVISIONAL").length;
  const insufficientCount = data.scoredProducts.filter((product) => product.score.status === "INSUFFICIENT_DATA").length;
  const missingCriticalEvidence = data.scoredProducts.filter((product) => product.score.missingInputs.length > 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Studio Dashboard"
        title="Strategy, sourcing, and scoring in one workspace"
        description="Use the dashboard to decide which market to enter first, where the current product database is credible, and which gaps should be closed before buyer-facing pilots."
        badge={focusCountry?.name}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total suppliers" value={String(data.suppliers.length)} detail="Seeded network ready for analyst review" />
        <KpiCard label="Total products" value={String(data.scoredProducts.length)} detail="Products scored against current framework" />
        <KpiCard label="Average sustainability score" value={formatNumber(averageScore, 1)} detail="Weighted and confidence-adjusted" />
        <KpiCard label="Provisional grades" value={String(provisionalCount)} detail="Products that need more proof or cleaner inputs" />
        <KpiCard label="Missing critical evidence" value={String(missingCriticalEvidence)} detail="Products with evidence or field gaps blocking stronger scores" />
        <KpiCard label="Recommended focus country" value={focusCountry?.name ?? "N/A"} detail={focusCountry?.recommendationSummary ?? "No priority market available"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <BarChartCard
          title="Product scores by category"
          description="Average final score for each seeded category."
          data={data.categoryAverages.map((item) => ({
            name: item.category.replaceAll("_", " "),
            score: item.averageScore,
          }))}
          dataKey="score"
        />
        {focusCountry ? (
          <CountryRadarCard
            title="Focus-market profile"
            countryName={focusCountry.name}
            data={[
              { metric: "Attractiveness", value: focusCountry.marketAttractivenessScore },
              { metric: "Horeca density", value: focusCountry.horecaDensityScore },
              { metric: "Sustainability", value: focusCountry.sustainabilityMaturityScore },
              { metric: "Ease", value: focusCountry.easeOfEntryScore },
              { metric: "Logistics", value: focusCountry.logisticsFitScore },
              { metric: "WTP", value: focusCountry.willingnessToPaySignalScore },
            ]}
          />
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChartCard
          title="Supplier evidence completeness"
          description="Higher completeness makes the final grade more defensible."
          data={data.suppliers.map((supplier) => ({
            name: supplier.name.split(" ")[0],
            completeness: supplier.evidenceCompletenessScore,
            fill: supplier.evidenceCompletenessScore >= 80 ? "#1f6a52" : "#d1a95b",
          }))}
          dataKey="completeness"
        />
        <BarChartCard
          title="Country attractiveness comparison"
          description="Weighted view of market pull, logistics, and willingness-to-pay signals."
          data={data.countries.map((country) => ({
            name: country.name,
            attractiveness: country.marketAttractivenessScore,
            readiness: country.easeOfEntryScore,
          }))}
          dataKey="attractiveness"
          secondaryKey="readiness"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Products needing review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.dashboardAlerts.productsNeedingReview.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-white p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm muted-copy">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers missing critical data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.dashboardAlerts.supplierGaps.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-white p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm muted-copy">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest-opportunity market segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-3xl bg-[var(--accent-soft)] p-5 text-[var(--accent-strong)]">
              <p className="text-lg font-semibold">{data.interviewInsights.bestSegment}</p>
              <p className="mt-2 text-sm">
                This segment combines high sustainability intent, enough openness to switch, and a practical need for comparison-led procurement.
              </p>
            </div>
            {data.interviewInsights.priorityDimensions.map((dimension) => (
              <div key={dimension.label} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <p className="text-sm font-medium">{dimension.label}</p>
                <Badge variant="neutral">{dimension.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Moves</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              "Pilot Netherlands cafés and office catering first, using drinkware plus one meal-format category.",
              "Standardize the supplier data request template before deeper outreach into Germany.",
              `Improve evidence completeness for ${data.potentialBProducts} products that could likely convert into clear B-grade options.`,
              "Turn the buyer-facing comparison view into a one-sheet sales aid for founder meetings.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-3xl border border-[var(--border)] bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why the focus market stands out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-3xl bg-white p-4">
              <Globe2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <div>
                <p className="font-semibold">{focusCountry?.name}</p>
                <p className="text-sm muted-copy">{focusCountry?.recommendationSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-3xl bg-white p-4">
              <TrendingUp className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <div>
                <p className="font-semibold">Competitor gap</p>
                <p className="text-sm muted-copy">{data.competitorWedge}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-3xl bg-white p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <div>
                <p className="font-semibold">Top buyer pain points</p>
                <p className="text-sm muted-copy">{data.interviewInsights.topPainPoints.join(", ")}.</p>
              </div>
            </div>
            {insufficientCount > 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-4 text-sm muted-copy">
                {insufficientCount} products are currently in insufficient-data territory and should not be shown as buyer-ready without extra evidence.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
