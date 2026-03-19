"use client";

import type { BuyerInterview, CountryResearch } from "@prisma/client";
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
  companyName: z.string().min(2),
  city: z.string().min(2),
  countryResearchId: z.string().min(1),
  businessType: z.string().min(2),
  numberOfLocations: z.coerce.number().int().min(1),
  currentSupplierType: z.string().min(2),
  sustainabilityImportance: z.coerce.number().int().min(1).max(5),
  priceSensitivity: z.coerce.number().int().min(1).max(5),
  opennessToAlternativeSuppliers: z.coerce.number().int().min(1).max(5),
  painPointsText: z.string().min(2),
  keyQuote: z.string().min(4),
  currentProductsBoughtText: z.string().min(2),
  willingnessToPayNotes: z.string().min(4),
  contactStatus: z.string().min(2),
  summaryInsight: z.string().min(4),
});

type FormValues = z.infer<typeof formSchema>;

export function InterviewsManager({
  interviews,
  countries,
}: {
  interviews: Array<BuyerInterview & { country: CountryResearch }>;
  countries: CountryResearch[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<(BuyerInterview & { country: CountryResearch }) | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      city: "",
      countryResearchId: countries[0]?.id ?? "",
      businessType: "",
      numberOfLocations: 1,
      currentSupplierType: "",
      sustainabilityImportance: 4,
      priceSensitivity: 3,
      opennessToAlternativeSuppliers: 4,
      painPointsText: "",
      keyQuote: "",
      currentProductsBoughtText: "",
      willingnessToPayNotes: "",
      contactStatus: "",
      summaryInsight: "",
    },
  });

  const columns = useMemo<ColumnDef<BuyerInterview & { country: CountryResearch }>[]>(
    () => [
      {
        header: "Company",
        accessorKey: "companyName",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.companyName}</p>
            <p className="text-xs muted-copy">{row.original.city}</p>
          </div>
        ),
      },
      {
        header: "Type",
        accessorKey: "businessType",
      },
      {
        header: "Country",
        accessorKey: "country.name",
        cell: ({ row }) => row.original.country.name,
      },
      {
        header: "Signals",
        cell: ({ row }) => (
          <div className="text-xs">
            <p>Importance {row.original.sustainabilityImportance}/5</p>
            <p>Price {row.original.priceSensitivity}/5</p>
            <p>Openness {row.original.opennessToAlternativeSuppliers}/5</p>
          </div>
        ),
      },
      {
        header: "Pain Points",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {((row.original.painPoints as string[]) ?? []).map((pain) => (
              <Badge key={pain}>{pain}</Badge>
            ))}
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
                const interview = row.original;
                setEditing(interview);
                form.reset({
                  companyName: interview.companyName,
                  city: interview.city,
                  countryResearchId: interview.countryResearchId,
                  businessType: interview.businessType,
                  numberOfLocations: interview.numberOfLocations,
                  currentSupplierType: interview.currentSupplierType,
                  sustainabilityImportance: interview.sustainabilityImportance,
                  priceSensitivity: interview.priceSensitivity,
                  opennessToAlternativeSuppliers: interview.opennessToAlternativeSuppliers,
                  painPointsText: ((interview.painPoints as string[]) ?? []).join(", "),
                  keyQuote: interview.keyQuote,
                  currentProductsBoughtText: ((interview.currentProductsBought as string[]) ?? []).join(", "),
                  willingnessToPayNotes: interview.willingnessToPayNotes,
                  contactStatus: interview.contactStatus,
                  summaryInsight: interview.summaryInsight,
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch(`/api/interviews/${row.original.id}`, { method: "DELETE" });
                toast.success("Interview deleted");
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
      companyName: values.companyName,
      city: values.city,
      countryResearchId: values.countryResearchId,
      businessType: values.businessType,
      numberOfLocations: values.numberOfLocations,
      currentSupplierType: values.currentSupplierType,
      sustainabilityImportance: values.sustainabilityImportance,
      priceSensitivity: values.priceSensitivity,
      opennessToAlternativeSuppliers: values.opennessToAlternativeSuppliers,
      painPoints: parseArrayInput(values.painPointsText),
      keyQuote: values.keyQuote,
      currentProductsBought: parseArrayInput(values.currentProductsBoughtText),
      willingnessToPayNotes: values.willingnessToPayNotes,
      contactStatus: values.contactStatus,
      summaryInsight: values.summaryInsight,
    };

    const response = await fetch(editing ? `/api/interviews/${editing.id}` : "/api/interviews", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to save interview");
      return;
    }

    toast.success(editing ? "Interview updated" : "Interview created");
    setEditing(null);
    form.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{editing ? "Edit buyer interview" : "Add buyer interview"}</CardTitle>
            <p className="mt-2 text-sm muted-copy">Capture field notes and desk research in a structured format.</p>
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
              <Field label="Company">
                <Input {...form.register("companyName")} />
              </Field>
              <Field label="City">
                <Input {...form.register("city")} />
              </Field>
              <Field label="Country">
                <Select {...form.register("countryResearchId")}>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Business type">
                <Input {...form.register("businessType")} />
              </Field>
              <Field label="Locations">
                <Input type="number" {...form.register("numberOfLocations")} />
              </Field>
              <Field label="Current supplier type">
                <Input {...form.register("currentSupplierType")} />
              </Field>
              <Field label="Sustainability importance">
                <Input type="number" min={1} max={5} {...form.register("sustainabilityImportance")} />
              </Field>
              <Field label="Price sensitivity">
                <Input type="number" min={1} max={5} {...form.register("priceSensitivity")} />
              </Field>
              <Field label="Openness to alternatives">
                <Input type="number" min={1} max={5} {...form.register("opennessToAlternativeSuppliers")} />
              </Field>
            </FieldGrid>

            <Field label="Pain points" hint="Comma separated">
              <Input {...form.register("painPointsText")} />
            </Field>
            <Field label="Current products bought" hint="Comma separated">
              <Input {...form.register("currentProductsBoughtText")} />
            </Field>
            <Field label="Key quote">
              <Textarea {...form.register("keyQuote")} />
            </Field>
            <Field label="Willingness to pay notes">
              <Textarea {...form.register("willingnessToPayNotes")} />
            </Field>
            <Field label="Contact status">
              <Input {...form.register("contactStatus")} />
            </Field>
            <Field label="Summary insight">
              <Textarea {...form.register("summaryInsight")} />
            </Field>

            <div className="flex justify-end">
              <Button type="submit">{editing ? "Save changes" : "Create interview"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Buyer interviews"
        description="Filter across operator interviews and desk-research style notes."
        columns={columns}
        data={interviews}
        searchPlaceholder="Search interviews"
      />
    </div>
  );
}
