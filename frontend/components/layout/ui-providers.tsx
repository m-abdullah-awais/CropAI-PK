"use client";

import * as React from "react";
import { Direction } from "radix-ui";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n/provider";

// Feeds the active language direction into Radix primitives (Select, DropdownMenu,
// Tooltip, ...), which do not read `dir` from the DOM. Also hosts the global
// TooltipProvider. Must live inside LanguageProvider so it can read the context.
export function UIProviders({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n();
  return (
    <Direction.Provider dir={dir}>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </Direction.Provider>
  );
}
