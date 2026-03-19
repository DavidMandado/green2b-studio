"use client";

import type { CountryResearch, RegulationNote } from "@prisma/client";
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
import { PRODUCT_CATEGORY_LABELS, REGULATION_THEME_LABELS } from "@/lib/constants";
import { parseArrayInput } from "@/lib/utils";

const formSchema = z.object({
  countryResearchId: z.string().min(1),
  productCategory: z.enum([
    "STRAWS",
    "TAKEAWAY_CUPS",
    "BOWLS",
    "CUTLERY",
    "LIDS",
    "NAPKINS",
    "FOOD_CONTAINERS",
  ]),
  theme: z.enum(["PACKAGING", "IMPORT", "WASTE", "LABELING", "PROOF", "CERTIFICATION", "FOOD_CONTACT"]),
  requirementTitle: z.string().min(4),
  description: z.string().min(4),
  businessImplication: z.string().min(4),
  requiredDocumentsText: z.string().min(2),
  complexityScore: z.coerce.number().min(0).max(100),
  urgencyScore: z.coerce.number().min(0).max(100),
  notes: z.string().min(4),
});

type RegulationWithCountry = RegulationNote & { country: CountryResearch };
type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

export function RegulationsManager({
  regulations,
  countries,
}: {
  regulations: RegulationWithCountry[];
  countries: CountryResearch[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<RegulationWithCountry | null>(null);

  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryResearchId: countries[0]?.id ?? "",
      productCategory: "STRAWS",
      theme: "PACKAGING",
      requirementTitle: "",
      description: "",
      businessImplication: "",
      requiredDocumentsText: "",
      complexityScore: 50,
      urgencyScore: 60,
      notes: "",
    },
  });

  const columns = useMemo<ColumnDef<RegulationWithCountry>[]>(
    () => [
      {
        header: "Requirement",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.requirementTitle}</p>
            <p className="text-xs muted-copy">{row.original.country.name}</p>
          </div>
        ),
      },
      {
        header: "Category",
        cell: ({ row }) => PRODUCT_CATEGORY_LABELS[row.original.productCategory],
      },
      {
        header: "Theme",
        cell: ({ row }) => <Badge variant="info">{REGULATION_THEME_LABELS[row.original.theme]}</Badge>,
      },
      {
        header: "Implication",
        accessorKey: "businessImplication",
      },
      {
        header: "Scores",
        cell: ({ row }) => (
          <div className="text-xs">
            <p>Complexity {row.original.complexityScore}</p>
            <p>Urgency {row.original.urgencyScore}</p>
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
                const regulation = row.original;
                setEditing(regulation);
                form.reset({
                  countryResearchId: regulation.countryResearchId,
                  productCategory: regulation.productCategory,
                  theme: regulation.theme,
                  requirementTitle: regulation.requirementTitle,
                  description: regulation.description,
                  businessImplication: regulation.businessImplication,
                  requiredDocumentsText: ((regulation.requiredDocuments as string[]) ?? []).join(", "),
                  complexityScore: regulation.complexityScore,
                  urgencyScore: regulation.urgencyScore,
                  notes: regulation.notes,
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch(`/api/regulations/${row.original.id}`, { method: "DELETE" });
                toast.success("Regulation note deleted");
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
      countryResearchId: values.countryResearchId,
      productCategory: values.productCategory,
      theme: values.theme,
      requirementTitle: values.requirementTitle,
      description: values.description,
      businessImplication: values.businessImplication,
      requiredDocuments: parseArrayInput(values.requiredDocumentsText),
      complexityScore: values.complexityScore,
      urgencyScore: values.urgencyScore,
      notes: values.notes,
    };

    const response = await fetch(editing ? `/api/regulations/${editing.id}` : "/api/regulations", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to save regulation note");
      return;
    }

    toast.success(editing ? "Regulation note updated" : "Regulation note created");
    setEditing(null);
    form.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{editing ? "Edit regulation note" : "Add regulation note"}</CardTitle>
            <p className="mt-2 text-sm muted-copy">Document country-level packaging, proof, and import requirements.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGrid>
              <Field label="Country">
                <Select {...form.register("countryResearchId")}>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Product category">
                <Select {...form.register("productCategory")}>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Theme">
                <Select {...form.register("theme")}>
                  {Object.entries(REGULATION_THEME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGrid>

            <Field label="Requirement title">
              <Input {...form.register("requirementTitle")} />
            </Field>
            <Field label="Description">
              <Textarea {...form.register("description")} />
            </Field>
            <Field label="Business implication">
              <Textarea {...form.register("businessImplication")} />
            </Field>
            <Field label="Required documents" hint="Comma separated">
              <Input {...form.register("requiredDocumentsText")} />
            </Field>

            <FieldGrid>
              <Field label="Complexity score">
                <Input type="number" {...form.register("complexityScore")} />
              </Field>
              <Field label="Urgency score">
                <Input type="number" {...form.register("urgencyScore")} />
              </Field>
            </FieldGrid>

            <Field label="Notes">
              <Textarea {...form.register("notes")} />
            </Field>

            <div className="flex justify-end">
              <Button type="submit">{editing ? "Save changes" : "Create regulation note"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Regulations and requirement notes"
        description="Country-level practical compliance and import snapshot for early market entry."
        columns={columns}
        data={regulations}
        searchPlaceholder="Search regulations"
      />
    </div>
  );
}
