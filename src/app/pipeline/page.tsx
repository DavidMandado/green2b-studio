import { PipelineDemo } from "@/components/shared/pipeline-demo";
import { PageHeader } from "@/components/shared/page-header";

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Workflow Demo"
        title="Intake-to-scoring pipeline"
        description="Narrative walkthrough of how Green2B could evolve from supplier intake into a structured workflow platform."
      />
      <PipelineDemo />
    </>
  );
}
