import Link from "next/link";

import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountries } from "@/lib/server/queries";

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <>
      <PageHeader
        eyebrow="Market Research"
        title="Country prioritization"
        description="Structured market selection across attractiveness, horeca density, sustainability maturity, logistics, and ease of entry."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {countries.map((country) => (
          <Card key={country.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{country.name}</CardTitle>
                {country.priorityMarket ? <Badge variant="success">Priority</Badge> : <Badge>Secondary</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm muted-copy">{country.recommendationSummary}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[var(--card-strong)] p-3">
                  <p className="muted-copy">Attractiveness</p>
                  <p className="mt-1 text-xl font-semibold">{country.marketAttractivenessScore}</p>
                </div>
                <div className="rounded-2xl bg-[var(--card-strong)] p-3">
                  <p className="muted-copy">Ease of entry</p>
                  <p className="mt-1 text-xl font-semibold">{country.easeOfEntryScore}</p>
                </div>
              </div>
              <Link href={`/research/countries/${country.id}`} className="text-sm font-semibold text-[var(--accent)]">
                Open detail page
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <BarChartCard
        title="Country comparison"
        description="Structured comparison across attractiveness and willingness-to-pay."
        data={countries.map((country) => ({
          name: country.name,
          attractiveness: country.marketAttractivenessScore,
          willingness: country.willingnessToPaySignalScore,
        }))}
        dataKey="attractiveness"
        secondaryKey="willingness"
      />

      <Card>
        <CardHeader>
          <CardTitle>Editable-style research table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Region</th>
                  <th className="pb-3">Attractiveness</th>
                  <th className="pb-3">Sustainability</th>
                  <th className="pb-3">Regulatory complexity</th>
                  <th className="pb-3">Entry</th>
                  <th className="pb-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.id} className="border-b border-[var(--border)]/60">
                    <td className="py-4 font-semibold">{country.name}</td>
                    <td className="py-4">{country.region}</td>
                    <td className="py-4">{country.marketAttractivenessScore}</td>
                    <td className="py-4">{country.sustainabilityMaturityScore}</td>
                    <td className="py-4">{country.regulatoryComplexityScore}</td>
                    <td className="py-4">{country.easeOfEntryScore}</td>
                    <td className="py-4">
                      <Link className="text-[var(--accent)]" href={`/research/countries/${country.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
