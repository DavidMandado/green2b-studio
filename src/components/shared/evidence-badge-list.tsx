import type { Evidence } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

export function EvidenceBadgeList({ evidence }: { evidence: Evidence[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {evidence.map((item) => (
        <Badge
          key={item.id}
          variant={
            item.verificationStatus === "VERIFIED"
              ? "success"
              : item.verificationStatus === "EXPIRED"
                ? "danger"
                : item.verificationStatus === "MISSING_CRITICAL"
                  ? "danger"
                  : "warning"
          }
        >
          {item.title}
        </Badge>
      ))}
    </div>
  );
}
