"use client";

import { useT } from "@/lib/i18n/provider";

// Condensed footer for the panel: keeps the real-data disclaimer and attribution
// visible in one quiet line, without a full marketing footer under a dashboard.
export function PanelFooter() {
  const t = useT();

  return (
    <footer className="border-t border-hairline px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl">{t.footer.tagline}</p>
        <p className="shrink-0">
          {t.footer.madeBy}{" "}
          <a
            href="https://abdullahawais.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Muhammad Abdullah Awais
          </a>
        </p>
      </div>
    </footer>
  );
}
