"use client";

import Link from "next/link";
import type { Evidence, Product, Supplier } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field, FieldGrid } from "@/components/forms/field";
import { DataTable } from "@/components/shared/data-table";
import { EvidenceBadgeList } from "@/components/shared/evidence-badge-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { CONTACT_STAGE_LABELS } from "@/lib/constants";
import { parseArrayInput } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2),
  supplierCode: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  website: z.string().min(2),
  primaryMaterialsText: z.string().min(2),
  productCategoriesText: z.string().min(2),
  bcorpCertified: z.boolean(),
  otherCertificationsText: z.string().optional(),
  evidenceCompletenessScore: z.coerce.number().min(0).max(100),
  contactStage: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PILOT", "NEGOTIATING", "ON_HOLD"]),
  reliabilityRating: z.coerce.number().min(0).max(100),
  notes: z.string().min(4),
  riskFlagsText: z.string().optional(),
});

type SupplierRow = Supplier & { evidence: Evidence[]; products: Product[] };
type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

export function SuppliersManager({ suppliers }: { suppliers: SupplierRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SupplierRow | null>(null);

  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      supplierCode: "",
      country: "",
      city: "",
      website: "",
      primaryMaterialsText: "",
      productCategoriesText: "",
      bcorpCertified: false,
      otherCertificationsText: "",
      evidenceCompletenessScore: 70,
      contactStage: "CONTACTED",
      reliabilityRating: 70,
      notes: "",
      riskFlagsText: "",
    },
  });

  const columns = useMemo<ColumnDef<SupplierRow>[]>(
    () => [
      {
        header: "Supplier",
        cell: ({ row }) => (
          <div>
            <Link href={`/suppliers/${row.original.id}`} className="font-semibold hover:text-[var(--accent)]">
              {row.original.name}
            </Link>
            <p className="text-xs muted-copy">
              {row.original.city}, {row.original.country}
            </p>
          </div>
        ),
      },
      {
        header: "Categories",
        cell: ({ row }) => ((row.original.productCategories as string[]) ?? []).join(", "),
      },
      {
        header: "Completeness",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.evidenceCompletenessScore}</p>
            <p className="text-xs muted-copy">Reliability {row.original.reliabilityRating}</p>
          </div>
        ),
      },
      {
        header: "Stage",
        cell: ({ row }) => <Badge variant="info">{CONTACT_STAGE_LABELS[row.original.contactStage]}</Badge>,
      },
      {
        header: "Evidence",
        cell: ({ row }) => <EvidenceBadgeList evidence={row.original.evidence.slice(0, 3)} />,
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const supplier = row.original;
                setEditing(supplier);
                form.reset({
                  name: supplier.name,
                  supplierCode: supplier.supplierCode,
                  country: supplier.country,
                  city: supplier.city,
                  website: supplier.website,
                  primaryMaterialsText: ((supplier.primaryMaterials as string[]) ?? []).join(", "),
                  productCategoriesText: ((supplier.productCategories as string[]) ?? []).join(", "),
                  bcorpCertified: supplier.bcorpCertified,
                  otherCertificationsText: ((supplier.otherCertifications as string[]) ?? []).join(", "),
                  evidenceCompletenessScore: supplier.evidenceCompletenessScore,
                  contactStage: supplier.contactStage,
                  reliabilityRating: supplier.reliabilityRating,
                  notes: supplier.notes,
                  riskFlagsText: ((supplier.riskFlags as string[]) ?? []).join(", "),
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch(`/api/suppliers/${row.original.id}`, { method: "DELETE" });
                toast.success("Supplier deleted");
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
      supplierCode: values.supplierCode,
      country: values.country,
      city: values.city,
      website: values.website,
      primaryMaterials: parseArrayInput(values.primaryMaterialsText),
      productCategories: parseArrayInput(values.productCategoriesText),
      bcorpCertified: values.bcorpCertified,
      otherCertifications: parseArrayInput(values.otherCertificationsText ?? ""),
      evidenceCompletenessScore: values.evidenceCompletenessScore,
      contactStage: values.contactStage,
      reliabilityRating: values.reliabilityRating,
      notes: values.notes,
      riskFlags: parseArrayInput(values.riskFlagsText ?? ""),
    };

    const response = await fetch(editing ? `/api/suppliers/${editing.id}` : "/api/suppliers", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to save supplier");
      return;
    }

    toast.success(editing ? "Supplier updated" : "Supplier created");
    setEditing(null);
    form.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{editing ? "Edit supplier" : "Add supplier"}</CardTitle>
            <p className="mt-2 text-sm muted-copy">Track supplier profile, credibility, and readiness for pilot sourcing.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGrid>
              <Field label="Supplier name">
                <Input {...form.register("name")} />
              </Field>
              <Field label="Supplier code">
                <Input {...form.register("supplierCode")} />
              </Field>
              <Field label="Country">
                <Input {...form.register("country")} />
              </Field>
              <Field label="City">
                <Input {...form.register("city")} />
              </Field>
              <Field label="Website">
                <Input {...form.register("website")} />
              </Field>
              <Field label="Contact stage">
                <Select {...form.register("contactStage")}>
                  {Object.entries(CONTACT_STAGE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGrid>
            <Field label="Primary materials" hint="Comma separated">
              <Input {...form.register("primaryMaterialsText")} />
            </Field>
            <Field label="Product categories" hint="Comma separated">
              <Input {...form.register("productCategoriesText")} />
            </Field>
            <Field label="Other certifications" hint="Comma separated">
              <Input {...form.register("otherCertificationsText")} />
            </Field>
            <Field label="Risk flags" hint="Comma separated">
              <Input {...form.register("riskFlagsText")} />
            </Field>
            <FieldGrid>
              <Field label="Evidence completeness">
                <Input type="number" {...form.register("evidenceCompletenessScore")} />
              </Field>
              <Field label="Reliability rating">
                <Input type="number" {...form.register("reliabilityRating")} />
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <input type="checkbox" {...form.register("bcorpCertified")} />
                <span className="text-sm font-medium">B Corp certified</span>
              </label>
            </FieldGrid>
            <Field label="Notes">
              <Textarea {...form.register("notes")} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">{editing ? "Save changes" : "Create supplier"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Supplier database"
        description="Supplier records, evidence posture, and readiness for buyer-facing comparison."
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers"
      />
    </div>
  );
}
