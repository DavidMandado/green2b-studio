"use client";

import type { Benchmark } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { FieldGrid } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import type { ScoringConfigShape } from "@/lib/scoring/defaults";
import { scoringConfigSchema } from "@/lib/validation";

export function ScoringSettingsForm({
  config,
  benchmarks,
}: {
  config: ScoringConfigShape;
  benchmarks: Benchmark[];
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(scoringConfigSchema),
    defaultValues: {
      pillarWeights: config.pillarWeights,
      gradeThresholds: config.gradeThresholds,
      missingDataPenalties: config.missingDataPenalties,
      rawWeight: config.rawWeight,
      confidenceWeight: config.confidenceWeight,
      notes: config.notes,
      benchmarks: benchmarks.map((benchmark) => ({
        category: benchmark.category,
        co2eBenchmark: benchmark.co2eBenchmark,
        waterBenchmark: benchmark.waterBenchmark,
      })),
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch("/api/settings/scoring", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          toast.error("Unable to save scoring settings");
          return;
        }

        toast.success("Scoring settings saved");
        router.refresh();
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Pillar weights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FieldGrid>
            {Object.keys(config.pillarWeights).map((key) => (
              <label key={key} className="grid gap-2">
                <span className="text-sm font-semibold capitalize">{key}</span>
                <Input type="number" {...form.register(`pillarWeights.${key}` as const, { valueAsNumber: true })} />
              </label>
            ))}
          </FieldGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Raw weight</span>
              <Input type="number" step="0.01" {...form.register("rawWeight", { valueAsNumber: true })} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Confidence weight</span>
              <Input type="number" step="0.01" {...form.register("confidenceWeight", { valueAsNumber: true })} />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Framework notes</span>
            <Textarea {...form.register("notes")} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade thresholds</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {config.gradeThresholds.map((threshold, index) => (
            <div key={threshold.grade} className="grid gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 sm:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Grade</span>
                <Input readOnly {...form.register(`gradeThresholds.${index}.grade` as const)} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Min</span>
                <Input type="number" step="0.01" {...form.register(`gradeThresholds.${index}.min` as const, { valueAsNumber: true })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Max</span>
                <Input type="number" step="0.01" {...form.register(`gradeThresholds.${index}.max` as const, { valueAsNumber: true })} />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Missing-data penalties</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Object.keys(config.missingDataPenalties).map((key) => (
            <label key={key} className="grid gap-2">
              <span className="text-sm font-semibold">{key}</span>
              <Input type="number" {...form.register(`missingDataPenalties.${key}` as const, { valueAsNumber: true })} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category benchmarks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {benchmarks.map((benchmark, index) => (
            <div key={benchmark.category} className="grid gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 sm:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Category</span>
                <Input readOnly {...form.register(`benchmarks.${index}.category` as const)} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">CO2e benchmark</span>
                <Input type="number" step="0.1" {...form.register(`benchmarks.${index}.co2eBenchmark` as const, { valueAsNumber: true })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Water benchmark</span>
                <Input type="number" step="0.1" {...form.register(`benchmarks.${index}.waterBenchmark` as const, { valueAsNumber: true })} />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="secondary"
          onClick={async (event) => {
            event.preventDefault();
            await fetch("/api/settings/scoring", { method: "DELETE" });
            toast.success("Defaults restored");
            router.refresh();
          }}
        >
          Reset to defaults
        </Button>
        <Button type="submit">Save scoring settings</Button>
      </div>
    </form>
  );
}
