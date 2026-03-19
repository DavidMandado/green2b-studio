import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MissingDataWarningPanel({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Missing Inputs Blocking a Stronger Grade</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-3xl bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-strong)]">
            Core scoring inputs are present.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="mt-0.5 rounded-full bg-[#faedcf] p-2 text-[#8f5a13]">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
