import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewsManager } from "@/components/research/interviews-manager";
import { aggregateInterviewInsights } from "@/lib/insights";
import { getCountries, getInterviews } from "@/lib/server/queries";

export default async function InterviewsPage() {
  const [interviews, countries] = await Promise.all([getInterviews(), getCountries()]);
  const insights = aggregateInterviewInsights(interviews);

  return (
    <>
      <PageHeader
        eyebrow="Market Research"
        title="Buyer interviews and field notes"
        description="Track structured buyer feedback from cafés, office pantry operators, hotels, and catering teams."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Top segment</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{insights.bestSegment}</p></CardContent>
        </Card>
        {insights.priorityDimensions.slice(0, 3).map((dimension) => (
          <Card key={dimension.label}>
            <CardHeader><CardTitle>{dimension.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{dimension.count}</p></CardContent>
          </Card>
        ))}
      </section>

      <InterviewsManager interviews={interviews} countries={countries} />
    </>
  );
}
