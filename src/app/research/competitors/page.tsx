import { CompetitorsManager } from "@/components/research/competitors-manager";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompetitorWedge } from "@/lib/insights";
import { getCompetitors } from "@/lib/server/queries";

export default async function CompetitorsPage() {
  const competitors = await getCompetitors();
  const wedge = getCompetitorWedge(competitors);

  return (
    <>
      <PageHeader
        eyebrow="Market Research"
        title="Competitor and comparator matrix"
        description="Map direct, indirect, and adjacent alternatives and keep Green2B’s positioning explicit."
      />

      <Card>
        <CardHeader>
          <CardTitle>Green2B wedge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-8">{wedge}</p>
        </CardContent>
      </Card>

      <CompetitorsManager competitors={competitors} />
    </>
  );
}
