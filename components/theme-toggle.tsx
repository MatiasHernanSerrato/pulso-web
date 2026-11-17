"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: typeof Sun;
};

const OPTIONS: ThemeOption[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes recomienda esto: hasta que no monte el componente no sabemos
  // el tema real y renderizar algo distinto genera hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // placeholder del mismo tamanio para que no se mueva el layout.
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cambiando tema"
        className="size-9"
        disabled
      >
        <Sun className="size-4 opacity-0" />
      </Button>
    );
  }

  const current = theme ?? "system";
  const CurrentIcon = iconFor(current, resolvedTheme);

  function cycle() {
    const idx = OPTIONS.findIndex((o) => o.value === current);
    const next = OPTIONS[(idx + 1) % OPTIONS.length];
    setTheme(next.value);
  }

  return (
    <div className="flex items-center gap-1">
      <div className="hidden md:flex items-center rounded-md border p-0.5">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-label={opt.label}
              aria-pressed={active}
              className={cn(
                "flex size-7 items-center justify-center rounded-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={cycle}
        aria-label={`Cambiar tema (actual: ${labelFor(current)})`}
        className="size-9 md:hidden"
      >
        <CurrentIcon className="size-4" />
      </Button>
    </div>
  );
}

function iconFor(theme: string, resolved: string | undefined) {
  if (theme === "system") return Monitor;
  if (theme === "dark" || resolved === "dark") return Moon;
  return Sun;
}

function labelFor(theme: string): string {
  const opt = OPTIONS.find((o) => o.value === theme);
  return opt?.label ?? "Sistema";
}
