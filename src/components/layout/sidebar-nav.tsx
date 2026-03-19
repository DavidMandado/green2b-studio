"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, Database, Factory, Globe2, LayoutDashboard, Settings2, Sparkles, TableProperties, Waypoints } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/research/countries": Globe2,
  "/research/interviews": ClipboardList,
  "/research/competitors": TableProperties,
  "/research/regulations": BarChart3,
  "/suppliers": Factory,
  "/products": Database,
  "/compare": Sparkles,
  "/pipeline": Waypoints,
  "/settings/scoring": Settings2,
  "/reports/summary": ClipboardList,
} as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.href as keyof typeof iconMap] ?? LayoutDashboard;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-white text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
