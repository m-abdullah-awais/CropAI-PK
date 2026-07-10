"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();

  // Icons are CSS-driven off the `.dark` class (set pre-paint by next-themes), so no
  // mount guard is needed and there is no hydration mismatch.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.theme.toggle}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </Button>
  );
}
