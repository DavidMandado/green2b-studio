import { notFound } from "next/navigation";

import { CountryRadarCard } from "@/components/charts/country-radar-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCT_CATEGORY_LABELS, REGULATION_THEME_LABELS } from "@/lib/constants";
import { getCountryById } from "@/lib/server/queries";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const country = await getCountryById(id);

  if (!country) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Country Detail"
        title={country.name}
        description={country.notes}
        badge={country.priorityMarket ? "Priority market" : "Secondary market"}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <CountryRadarCard
          title="Market profile"
          countryName={country.name}
          data={[
            { metric: "Attractiveness", value: country.marketAttractivenessScore },
            { metric: "Horeca density", value: country.horecaDensityScore },
            { metric: "Sustainability", value: country.sustainabilityMaturityScore },
            { metric: "Regulatory", value: country.regulatoryComplexityScore },
            { metric: "Entry", value: country.easeOfEntryScore },
            { metric: "Logistics", value: country.logisticsFitScore },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Recommendation summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-7">{country.recommendationSummary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Market attractiveness", country.marketAttractivenessScore],
                ["Horeca density", country.horecaDensityScore],
                ["Sustainability maturity", country.sustainabilityMaturityScore],
                ["Ease of entry", country.easeOfEntryScore],
                ["Logistics fit", country.logisticsFitScore],
                ["Willingness to pay", country.willingnessToPaySignalScore],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-[var(--card-strong)] p-4">
                  <p className="text-sm muted-copy">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buyer signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {country.interviews.map((interview) => (
              <div key={interview.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-semibold">{interview.companyName}</p>
                  <Badge variant="neutral">{interview.businessType}</Badge>
                </div>
                <p className="text-sm muted-copy">{interview.summaryInsight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulations snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {country.regulations.map((regulation) => (
              <div key={regulation.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="info">{REGULATION_THEME_LABELS[regulation.theme]}</Badge>
                  <Badge>{PRODUCT_CATEGORY_LABELS[regulation.productCategory]}</Badge>
                </div>
                <p className="font-semibold">{regulation.requirementTitle}</p>
                <p className="mt-2 text-sm muted-copy">{regulation.businessImplication}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
