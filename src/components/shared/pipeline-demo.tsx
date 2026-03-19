"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, FileCheck2, Files, ScanSearch, Send, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { REQUEST_TEMPLATES } from "@/lib/request-templates";

const steps = [
  { title: "Supplier submits product details", icon: Send, copy: "Core commercial, material, transport, and disclosure fields enter the intake form." },
  { title: "Evidence is attached", icon: Files, copy: "Certificates, spec sheets, declarations, and audit notes are linked to the supplier or product." },
  { title: "Data is normalized", icon: ScanSearch, copy: "Inputs are mapped into a consistent scoring-ready structure." },
  { title: "Missing fields are flagged", icon: ShieldCheck, copy: "Critical gaps trigger warnings before the product is shown as buyer-ready." },
  { title: "Product is scored", icon: Sparkles, copy: "Weighted pillar logic combines sustainability inputs with a confidence adjustment." },
  { title: "Buyer-facing grade card is generated", icon: FileCheck2, copy: "A concise output explains grade, status, price, and proof quality." },
  { title: "Compared to category average", icon: CheckCircle2, copy: "Analysts and buyers can position the product against peers in the same category." },
];

export function PipelineDemo() {
  const [category, setCategory] = useState<keyof typeof REQUEST_TEMPLATES>("STRAWS");
  const template = REQUEST_TEMPLATES[category];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-7">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="relative overflow-hidden">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Step {index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-2 text-sm muted-copy">{step.copy}</p>
                </div>
                {index < steps.length - 1 ? <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-[var(--muted)]" /> : null}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Data request template generator</CardTitle>
            <p className="mt-2 text-sm muted-copy">Generate the checklist Green2B should send suppliers before a scoring pass.</p>
          </div>
          <Select value={category} onChange={(event) => setCategory(event.target.value as keyof typeof REQUEST_TEMPLATES)}>
            {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 text-sm muted-copy">{template.summary}</p>
            <div className="space-y-3">
              {template.checklist.map((item) => (
                <label key={item} className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-white p-4">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={() => window.open(`/api/request-template?category=${category}&format=json`, "_blank")}>
              Export JSON
            </Button>
            <Button onClick={() => window.open(`/api/request-template?category=${category}&format=csv`, "_blank")}>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
