"use client";

import type { Competitor } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field, FieldGrid } from "@/components/forms/field";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { parseArrayInput } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["DIRECT", "INDIRECT", "ADJACENT"]),
  geography: z.string().min(2),
  targetCustomersText: z.string().min(2),
  strengthsText: z.string().min(2),
  weaknessesText: z.string().min(2),
  pricingSignal: z.string().min(2),
  hasScoringFeature: z.boolean(),
  hasCertificationFeature: z.boolean(),
  hasSourcingFeature: z.boolean(),
  hasMarketplaceFeature: z.boolean(),
  notes: z.string().min(4),
  differentiationNotes: z.string().min(4),
});

type FormValues = z.infer<typeof formSchema>;

export function CompetitorsManager({ competitors }: { competitors: Competitor[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Competitor | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "DIRECT",
      geography: "",
      targetCustomersText: "",
      strengthsText: "",
      weaknessesText: "",
      pricingSignal: "",
      hasScoringFeature: false,
      hasCertificationFeature: false,
      hasSourcingFeature: false,
      hasMarketplaceFeature: false,
      notes: "",
      differentiationNotes: "",
    },
  });

  const columns = useMemo<ColumnDef<Competitor>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.name}</p>
            <p className="text-xs muted-copy">{row.original.geography}</p>
          </div>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => <Badge variant="info">{row.original.type.toLowerCase()}</Badge>,
      },
      {
        header: "Strengths",
        cell: ({ row }) => ((row.original.strengths as string[]) ?? []).join(", "),
      },
      {
        header: "Weaknesses",
        cell: ({ row }) => ((row.original.weaknesses as string[]) ?? []).join(", "),
      },
      {
        header: "Feature flags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.hasScoringFeature ? <Badge>Scoring</Badge> : null}
            {row.original.hasCertificationFeature ? <Badge>Certification</Badge> : null}
            {row.original.hasSourcingFeature ? <Badge>Sourcing</Badge> : null}
            {row.original.hasMarketplaceFeature ? <Badge>Marketplace</Badge> : null}
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const competitor = row.original;
                setEditing(competitor);
                form.reset({
                  name: competitor.name,
                  type: competitor.type,
                  geography: competitor.geography,
                  targetCustomersText: ((competitor.targetCustomers as string[]) ?? []).join(", "),
                  strengthsText: ((competitor.strengths as string[]) ?? []).join(", "),
                  weaknessesText: ((competitor.weaknesses as string[]) ?? []).join(", "),
                  pricingSignal: competitor.pricingSignal,
                  hasScoringFeature: competitor.hasScoringFeature,
                  hasCertificationFeature: competitor.hasCertificationFeature,
                  hasSourcingFeature: competitor.hasSourcingFeature,
                  hasMarketplaceFeature: competitor.hasMarketplaceFeature,
                  notes: competitor.notes,
                  differentiationNotes: competitor.differentiationNotes,
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch(`/api/competitors/${row.original.id}`, { method: "DELETE" });
                toast.success("Competitor deleted");
                router.refresh();
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [form, router],
  );

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      type: values.type,
      geography: values.geography,
      targetCustomers: parseArrayInput(values.targetCustomersText),
      strengths: parseArrayInput(values.strengthsText),
      weaknesses: parseArrayInput(values.weaknessesText),
      pricingSignal: values.pricingSignal,
      hasScoringFeature: values.hasScoringFeature,
      hasCertificationFeature: values.hasCertificationFeature,
      hasSourcingFeature: values.hasSourcingFeature,
      hasMarketplaceFeature: values.hasMarketplaceFeature,
      notes: values.notes,
      differentiationNotes: values.differentiationNotes,
    };

    const response = await fetch(editing ? `/api/competitors/${editing.id}` : "/api/competitors", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to save competitor");
      return;
    }

    toast.success(editing ? "Competitor updated" : "Competitor created");
    setEditing(null);
    form.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{editing ? "Edit competitor" : "Add competitor"}</CardTitle>
            <p className="mt-2 text-sm muted-copy">Maintain the comparator landscape and Green2B differentiation logic.</p>
          </div>
          {editing ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                form.reset();
              }}
            >
              Cancel edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGrid>
              <Field label="Name">
                <Input {...form.register("name")} />
              </Field>
              <Field label="Type">
                <Select {...form.register("type")}>
                  <option value="DIRECT">Direct</option>
                  <option value="INDIRECT">Indirect</option>
                  <option value="ADJACENT">Adjacent</option>
                </Select>
              </Field>
              <Field label="Geography">
                <Input {...form.register("geography")} />
              </Field>
            </FieldGrid>

            <Field label="Target customers" hint="Comma separated">
              <Input {...form.register("targetCustomersText")} />
            </Field>
            <Field label="Strengths" hint="Comma separated">
              <Input {...form.register("strengthsText")} />
            </Field>
            <Field label="Weaknesses" hint="Comma separated">
              <Input {...form.register("weaknessesText")} />
            </Field>

            <FieldGrid>
              <Field label="Pricing signal">
                <Input {...form.register("pricingSignal")} />
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <input type="checkbox" {...form.register("hasScoringFeature")} />
                <span className="text-sm font-medium">Scoring feature</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <input type="checkbox" {...form.register("hasCertificationFeature")} />
                <span className="text-sm font-medium">Certification feature</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <input type="checkbox" {...form.register("hasSourcingFeature")} />
                <span className="text-sm font-medium">Sourcing feature</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <input type="checkbox" {...form.register("hasMarketplaceFeature")} />
                <span className="text-sm font-medium">Marketplace feature</span>
              </label>
            </FieldGrid>

            <Field label="Notes">
              <Textarea {...form.register("notes")} />
            </Field>
            <Field label="Green2B differentiation">
              <Textarea {...form.register("differentiationNotes")} />
            </Field>

            <div className="flex justify-end">
              <Button type="submit">{editing ? "Save changes" : "Create competitor"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Competitor matrix"
        description="Track direct, indirect, and adjacent alternatives plus Green2B’s wedge."
        columns={columns}
        data={competitors}
        searchPlaceholder="Search competitors"
      />
    </div>
  );
}
