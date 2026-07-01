"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { LANGUAGES } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
      >
        <Globe className="size-4" />
        <span>{current.native}</span>
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-1 min-w-40 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary",
                l.code === lang ? "bg-secondary/60 font-medium" : "text-foreground",
              )}
            >
              <span className="flex-1 text-start">{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
              {l.code === lang && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
