import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";

export async function AppShell({
  activeRole,
  children,
}: {
  activeRole: keyof typeof ROLE_LABELS;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="no-print border-b border-[var(--border)] bg-[rgba(238,233,222,0.7)] px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="card-surface rounded-[28px] p-5">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Green2B Studio</p>
                  <p className="text-sm muted-copy">Strategy and scoring prototype</p>
                </div>
              </Link>
            </div>
            <Badge variant="success">MVP</Badge>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">View Mode</p>
            <RoleSwitcher activeRole={activeRole} />
          </div>

          <SidebarNav />
        </div>
      </aside>

      <div className="min-w-0 px-4 py-5 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1480px]">
          <header className="no-print mb-6 flex flex-col gap-3 rounded-[28px] border border-[var(--border)] bg-white/75 px-6 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {ROLE_LABELS[activeRole]}
              </p>
              <p className="mt-1 text-sm muted-copy">
                Internal workspace for market selection, supplier scoring, and buyer-ready comparison.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">Prototype</Badge>
              <Badge variant="neutral">Local demo dataset</Badge>
            </div>
          </header>

          <main className="page-grid">{children}</main>
        </div>
      </div>
    </div>
  );
}
