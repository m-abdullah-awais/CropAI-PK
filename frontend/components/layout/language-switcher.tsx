"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { LANGUAGES } from "@/lib/i18n/translations";
import type { Lang } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Language"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="size-4" />
        <span>{current.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(v) => setLang(v as Lang)}
        >
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code}>
              <span className="flex-1">{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
