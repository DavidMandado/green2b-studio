"use client";

import { useTransition } from "react";

import { ROLE_LABELS } from "@/lib/constants";

export function RoleSwitcher({ activeRole }: { activeRole: keyof typeof ROLE_LABELS }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/90 p-1">
      <div className="grid grid-cols-3 gap-1">
        {Object.entries(ROLE_LABELS).map(([value, label]) => {
          const isActive = value === activeRole;

          return (
            <button
              key={value}
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await fetch("/api/role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: value }),
                  });
                  window.location.reload();
                })
              }
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:bg-[var(--card-strong)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
