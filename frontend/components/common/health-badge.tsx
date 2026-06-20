"use client";

import * as React from "react";
import { getHealth } from "@/lib/api/ml";
import { cn } from "@/lib/utils";

type State = "checking" | "online" | "offline";

export function HealthBadge() {
  const [state, setState] = React.useState<State>("checking");

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
    checking: { label: "Checking API…", dot: "bg-muted-foreground" },
    online: { label: "API online", dot: "bg-primary" },
    offline: { label: "API offline", dot: "bg-destructive" },
  }[state];

  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
      <span className={cn("size-2 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
}
