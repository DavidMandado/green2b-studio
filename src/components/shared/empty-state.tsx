import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Inbox className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-2 max-w-md text-sm muted-copy">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
