"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboItem {
  value: string;
  label: string;
  hint?: string;
}

// Searchable single-select: a trigger that opens a filterable list. Keyboard: type to
// filter, Up/Down to move, Enter to pick, Esc to close. Used for cities and crops.
export function Combobox({
  items,
  value,
  onChange,
  id,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading = false,
  className,
}: {
  items: ComboItem[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const activeRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();

  const selected = items.find((i) => i.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.hint?.toLowerCase().includes(q),
    );
  }, [items, query]);

  React.useEffect(() => {
    if (open) activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function search(next: string) {
    setQuery(next);
    setActive(0);
  }

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[active];
      if (it) choose(it.value);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-2 border-b border-hairline px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id={listboxId} role="listbox" className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </li>
          ) : (
            filtered.map((it, i) => (
              <li key={it.value}>
                <button
                  ref={i === active ? activeRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={it.value === value}
                  onClick={() => choose(it.value)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors",
                    i === active ? "bg-secondary" : "hover:bg-secondary/60",
                  )}
                >
                  <span className="truncate">
                    {it.label}
                    {it.hint && (
                      <span className="ms-1.5 text-xs text-muted-foreground">
                        {it.hint}
                      </span>
                    )}
                  </span>
                  {it.value === value && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
