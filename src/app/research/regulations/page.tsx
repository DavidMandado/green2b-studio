import { RegulationsManager } from "@/components/research/regulations-manager";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountries, getRegulations } from "@/lib/server/queries";

export default async function RegulationsPage() {
  const [regulations, countries] = await Promise.all([getRegulations(), getCountries()]);
  const requestedDocuments = [...new Set(regulations.flatMap((item) => (item.requiredDocuments as string[]) ?? []))];

  return (
    <>
      <PageHeader
        eyebrow="Market Research"
        title="Regulations and requirements snapshot"
        description="Practical market-entry notes covering packaging claims, proof expectations, and importer-facing readiness."
      />

      <Card>
        <CardHeader>
          <CardTitle>What suppliers should be asked for</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {requestedDocuments.map((item) => (
            <div key={item} className="rounded-3xl border border-[var(--border)] bg-white p-4 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <RegulationsManager regulations={regulations} countries={countries} />
    </>
  );
}
