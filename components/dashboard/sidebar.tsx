"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, LineChart, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: Activity },
  { href: "/dashboard/peso", label: "Peso", icon: LineChart },
  { href: "/dashboard/plata", label: "Plata", icon: Wallet },
  { href: "/dashboard/anomalias", label: "Anomalias", icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card/40 px-3 py-6 md:block">
      <div className="px-3 pb-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Pulso
        </Link>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
