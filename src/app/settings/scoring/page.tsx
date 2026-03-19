import { ScoringSettingsForm } from "@/components/forms/scoring-settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoringContext } from "@/lib/server/queries";

export default async function ScoringSettingsPage() {
  const { config, benchmarks } = await getScoringContext();

  return (
    <>
      <PageHeader
        eyebrow="Admin Settings"
        title="Scoring engine configuration"
        description="Adjust weights, thresholds, benchmarks, and penalty assumptions. Changes apply across scorecards and buyer comparison views."
      />
      <Card>
        <CardHeader>
          <CardTitle>Framework summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-7">{config.notes}</p>
        </CardContent>
      </Card>
      <ScoringSettingsForm config={config} benchmarks={benchmarks} />
    </>
  );
}
