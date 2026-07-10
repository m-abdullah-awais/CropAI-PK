"use client";

import * as React from "react";
import { getHealth } from "@/lib/api/ml";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

type State = "checking" | "online" | "offline";

export function HealthBadge() {
  const [state, setState] = React.useState<State>("checking");
  const t = useT();

  React.useEffect(() => {
    let active = true;
    getHealth()
      .then((h) => active && setState(h.models_loaded ? "online" : "offline"))
      .catch(() => active && setState("offline"));
    return () => {
      active = false;
    };
  }, []);

  const map = {
    checking: { label: t.health.checking, dot: "bg-muted-foreground" },
    online: { label: t.health.online, dot: "bg-tool-recommend" },
    offline: { label: t.health.offline, dot: "bg-destructive" },
  }[state];

  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-e1">
      <span className="relative flex size-2">
        {state === "online" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-tool-recommend opacity-60 motion-reduce:hidden" />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", map.dot)} />
      </span>
      {map.label}
    </span>
  );
}
