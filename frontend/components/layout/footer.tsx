"use client";

import { Leaf } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Leaf className="size-4 text-primary" />
          CropAI PK
        </div>
        <p className="mt-2 max-w-2xl">{t.footer.tagline}</p>
        <p className="mt-3 text-xs">{t.footer.data}</p>
        <p className="mt-4 text-xs">
          {t.footer.madeBy}{" "}
          <span className="font-medium text-foreground">
            Muhammad Abdullah Awais
          </span>{" "}
          -{" "}
          <a
            href="https://abdullahawais.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            abdullahawais.com
          </a>
        </p>
      </div>
    </footer>
  );
}
