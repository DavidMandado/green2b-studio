"use client";

import Link from "next/link";
import type { Product, Supplier } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field, FieldGrid } from "@/components/forms/field";
import { ProductGradeCard } from "@/components/products/product-grade-card";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ScoredProductRecord } from "@/lib/insights";

const boolish = z.enum(["unknown", "true", "false"]);

const formSchema = z.object({
  supplierId: z.string().min(1),
  productCode: z.string().min(2),
  productName: z.string().min(2),
  category: z.enum([
    "STRAWS",
    "TAKEAWAY_CUPS",
    "BOWLS",
    "CUTLERY",
    "LIDS",
    "NAPKINS",
    "FOOD_CONTAINERS",
  ]),
  targetSegment: z.string().min(2),
  unitPriceEur: z.coerce.number().min(0),
  currency: z.string().min(3),
  minimumOrderQuantity: z.coerce.number().int().min(1),
  leadTimeDays: z.coerce.number().int().min(1),
  originCountry: z.string().min(2),
  materialDescription: z.string().min(2),
  renewableMaterialPercent: z.string().optional(),
  recycledMaterialPercent: z.string().optional(),
  virginPlasticPercent: z.string().optional(),
  plasticLining: boolish,
  recyclableInPractice: boolish,
  industrialCompostable: boolish,
  homeCompostable: boolish,
  packagingMaterial: z.string().optional(),
  packagingRecycledContentPercent: z.string().optional(),
  packagingWeightGramsPer100Units: z.string().optional(),
  productWeightGramsPer100Units: z.string().optional(),
  estimatedCo2ePer1000Units: z.string().optional(),
  estimatedWaterLitersPer1000Units: z.string().optional(),
  transportMode: z.string().optional(),
  distanceKm: z.string().optional(),
  supplierDisclosureScore: z.string().optional(),
  laborPolicyScore: z.string().optional(),
  traceabilityScore: z.string().optional(),
  evidenceStatus: z.string().min(2),
  notes: z.string().min(4),
});

type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

function fromNullableNumber(value: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function fromNullableBool(value: boolean | null) {
  return value === null || value === undefined ? "unknown" : value ? "true" : "false";
}

function toNullableNumber(value?: string) {
  if (!value?.trim()) {
    return null;
  }
  return Number(value);
}

function toNullableBool(value: "unknown" | "true" | "false") {
  if (value === "unknown") {
    return null;
  }
  return value === "true";
}

export function ProductsManager({
  products,
  suppliers,
  categoryAverages,
}: {
  products: ScoredProductRecord[];
  suppliers: Supplier[];
  categoryAverages: Record<string, number>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);

  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: suppliers[0]?.id ?? "",
      productCode: "",
      productName: "",
      category: "STRAWS",
      targetSegment: "",
      unitPriceEur: 0.01,
      currency: "EUR",
      minimumOrderQuantity: 1000,
      leadTimeDays: 14,
      originCountry: "",
      materialDescription: "",
      renewableMaterialPercent: "",
      recycledMaterialPercent: "",
      virginPlasticPercent: "",
      plasticLining: "unknown",
      recyclableInPractice: "unknown",
      industrialCompostable: "unknown",
      homeCompostable: "unknown",
      packagingMaterial: "",
      packagingRecycledContentPercent: "",
      packagingWeightGramsPer100Units: "",
      productWeightGramsPer100Units: "",
      estimatedCo2ePer1000Units: "",
      estimatedWaterLitersPer1000Units: "",
      transportMode: "",
      distanceKm: "",
      supplierDisclosureScore: "",
      laborPolicyScore: "",
      traceabilityScore: "",
      evidenceStatus: "",
      notes: "",
    },
  });

  const columns = useMemo<ColumnDef<ScoredProductRecord>[]>(
    () => [
      {
        header: "Product",
        cell: ({ row }) => (
          <div>
            <Link href={`/products/${row.original.id}`} className="font-semibold hover:text-[var(--accent)]">
              {row.original.productName}
            </Link>
            <p className="text-xs muted-copy">{row.original.supplier.name}</p>
          </div>
        ),
      },
      {
        header: "Category",
        cell: ({ row }) => PRODUCT_CATEGORY_LABELS[row.original.category],
      },
      {
        header: "Grade",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={row.original.score.grade === "A" ? "success" : row.original.score.grade === "B" ? "info" : row.original.score.grade === "C" ? "warning" : "danger"}>
              {row.original.score.grade}
            </Badge>
            <span>{row.original.score.finalScore}</span>
          </div>
        ),
      },
      {
        header: "Price",
        accessorKey: "unitPriceEur",
      },
      {
        header: "Confidence",
        cell: ({ row }) => row.original.score.confidenceScore,
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const product = row.original;
                setEditing(product);
                form.reset({
                  supplierId: product.supplierId,
                  productCode: product.productCode,
                  productName: product.productName,
                  category: product.category,
                  targetSegment: product.targetSegment,
                  unitPriceEur: product.unitPriceEur,
                  currency: product.currency,
                  minimumOrderQuantity: product.minimumOrderQuantity,
                  leadTimeDays: product.leadTimeDays,
                  originCountry: product.originCountry,
                  materialDescription: product.materialDescription,
                  renewableMaterialPercent: fromNullableNumber(product.renewableMaterialPercent),
                  recycledMaterialPercent: fromNullableNumber(product.recycledMaterialPercent),
                  virginPlasticPercent: fromNullableNumber(product.virginPlasticPercent),
                  plasticLining: fromNullableBool(product.plasticLining),
                  recyclableInPractice: fromNullableBool(product.recyclableInPractice),
                  industrialCompostable: fromNullableBool(product.industrialCompostable),
                  homeCompostable: fromNullableBool(product.homeCompostable),
                  packagingMaterial: product.packagingMaterial ?? "",
                  packagingRecycledContentPercent: fromNullableNumber(product.packagingRecycledContentPercent),
                  packagingWeightGramsPer100Units: fromNullableNumber(product.packagingWeightGramsPer100Units),
                  productWeightGramsPer100Units: fromNullableNumber(product.productWeightGramsPer100Units),
                  estimatedCo2ePer1000Units: fromNullableNumber(product.estimatedCo2ePer1000Units),
                  estimatedWaterLitersPer1000Units: fromNullableNumber(product.estimatedWaterLitersPer1000Units),
                  transportMode: product.transportMode ?? "",
                  distanceKm: fromNullableNumber(product.distanceKm),
                  supplierDisclosureScore: fromNullableNumber(product.supplierDisclosureScore),
                  laborPolicyScore: fromNullableNumber(product.laborPolicyScore),
                  traceabilityScore: fromNullableNumber(product.traceabilityScore),
                  evidenceStatus: product.evidenceStatus,
                  notes: product.notes,
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch(`/api/products/${row.original.id}`, { method: "DELETE" });
                toast.success("Product deleted");
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
      supplierId: values.supplierId,
      productCode: values.productCode,
      productName: values.productName,
      category: values.category,
      targetSegment: values.targetSegment,
      unitPriceEur: values.unitPriceEur,
      currency: values.currency,
      minimumOrderQuantity: values.minimumOrderQuantity,
      leadTimeDays: values.leadTimeDays,
      originCountry: values.originCountry,
      materialDescription: values.materialDescription,
      renewableMaterialPercent: toNullableNumber(values.renewableMaterialPercent),
      recycledMaterialPercent: toNullableNumber(values.recycledMaterialPercent),
      virginPlasticPercent: toNullableNumber(values.virginPlasticPercent),
      plasticLining: toNullableBool(values.plasticLining),
      recyclableInPractice: toNullableBool(values.recyclableInPractice),
      industrialCompostable: toNullableBool(values.industrialCompostable),
      homeCompostable: toNullableBool(values.homeCompostable),
      packagingMaterial: values.packagingMaterial || null,
      packagingRecycledContentPercent: toNullableNumber(values.packagingRecycledContentPercent),
      packagingWeightGramsPer100Units: toNullableNumber(values.packagingWeightGramsPer100Units),
      productWeightGramsPer100Units: toNullableNumber(values.productWeightGramsPer100Units),
      estimatedCo2ePer1000Units: toNullableNumber(values.estimatedCo2ePer1000Units),
      estimatedWaterLitersPer1000Units: toNullableNumber(values.estimatedWaterLitersPer1000Units),
      transportMode: values.transportMode || null,
      distanceKm: toNullableNumber(values.distanceKm),
      supplierDisclosureScore: toNullableNumber(values.supplierDisclosureScore),
      laborPolicyScore: toNullableNumber(values.laborPolicyScore),
      traceabilityScore: toNullableNumber(values.traceabilityScore),
      evidenceStatus: values.evidenceStatus,
      notes: values.notes,
    };

    const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to save product");
      return;
    }

    toast.success(editing ? "Product updated" : "Product created");
    setEditing(null);
    form.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit product" : "Add product"}</CardTitle>
          <p className="text-sm muted-copy">Capture commercial, materials, transport, and disclosure inputs for scoring.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGrid>
              <Field label="Supplier">
                <Select {...form.register("supplierId")}>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Product code">
                <Input {...form.register("productCode")} />
              </Field>
              <Field label="Product name">
                <Input {...form.register("productName")} />
              </Field>
              <Field label="Category">
                <Select {...form.register("category")}>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Target segment">
                <Input {...form.register("targetSegment")} />
              </Field>
              <Field label="Origin country">
                <Input {...form.register("originCountry")} />
              </Field>
              <Field label="Unit price EUR">
                <Input type="number" step="0.001" {...form.register("unitPriceEur")} />
              </Field>
              <Field label="Currency">
                <Input {...form.register("currency")} />
              </Field>
              <Field label="MOQ">
                <Input type="number" {...form.register("minimumOrderQuantity")} />
              </Field>
              <Field label="Lead time days">
                <Input type="number" {...form.register("leadTimeDays")} />
              </Field>
              <Field label="Material description" hint="Main materials and barriers/coatings">
                <Input {...form.register("materialDescription")} />
              </Field>
            </FieldGrid>

            <FieldGrid>
              <Field label="Renewable material %">
                <Input {...form.register("renewableMaterialPercent")} />
              </Field>
              <Field label="Recycled material %">
                <Input {...form.register("recycledMaterialPercent")} />
              </Field>
              <Field label="Virgin plastic %">
                <Input {...form.register("virginPlasticPercent")} />
              </Field>
              <Field label="Plastic lining">
                <Select {...form.register("plasticLining")}>
                  <option value="unknown">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </Field>
              <Field label="Recyclable in practice">
                <Select {...form.register("recyclableInPractice")}>
                  <option value="unknown">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </Field>
              <Field label="Industrial compostable">
                <Select {...form.register("industrialCompostable")}>
                  <option value="unknown">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </Field>
              <Field label="Home compostable">
                <Select {...form.register("homeCompostable")}>
                  <option value="unknown">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </Field>
              <Field label="Packaging material">
                <Input {...form.register("packagingMaterial")} />
              </Field>
              <Field label="Packaging recycled content %">
                <Input {...form.register("packagingRecycledContentPercent")} />
              </Field>
              <Field label="Packaging weight g / 100 units">
                <Input {...form.register("packagingWeightGramsPer100Units")} />
              </Field>
              <Field label="Product weight g / 100 units">
                <Input {...form.register("productWeightGramsPer100Units")} />
              </Field>
            </FieldGrid>

            <FieldGrid>
              <Field label="CO2e / 1000 units">
                <Input {...form.register("estimatedCo2ePer1000Units")} />
              </Field>
              <Field label="Water liters / 1000 units">
                <Input {...form.register("estimatedWaterLitersPer1000Units")} />
              </Field>
              <Field label="Transport mode">
                <Input {...form.register("transportMode")} />
              </Field>
              <Field label="Distance km">
                <Input {...form.register("distanceKm")} />
              </Field>
              <Field label="Supplier disclosure score">
                <Input {...form.register("supplierDisclosureScore")} />
              </Field>
              <Field label="Labor policy score">
                <Input {...form.register("laborPolicyScore")} />
              </Field>
              <Field label="Traceability score">
                <Input {...form.register("traceabilityScore")} />
              </Field>
              <Field label="Evidence status">
                <Input {...form.register("evidenceStatus")} />
              </Field>
            </FieldGrid>

            <Field label="Notes">
              <Textarea {...form.register("notes")} />
            </Field>

            <div className="flex justify-end">
              <Button type="submit">{editing ? "Save changes" : "Create product"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Products"
        description="Commercial and sustainability inputs scored against the current framework."
        columns={columns}
        data={products}
        searchPlaceholder="Search products"
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <ProductGradeCard
            key={product.id}
            product={product}
            categoryAverage={categoryAverages[product.category]}
          />
        ))}
      </section>
    </div>
  );
}
