import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium muted-copy">{label}</p>
          <div className="rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm muted-copy">{detail}</p>
      </CardContent>
    </Card>
  );
}
