"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavItem } from "./sidebar-nav";

// Active-item accent bar colour, per tool identity (dashboard falls back to primary).
const ACCENT_BAR: Record<string, string> = {
  recommend: "bg-tool-recommend",
  yield: "bg-tool-yield",
  rotation: "bg-tool-rotation",
};

export function SidebarNavItem({
  item,
  label,
  active,
  collapsed = false,
  tooltipSide = "right",
  onNavigate,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  collapsed?: boolean;
  tooltipSide?: "left" | "right";
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const bar = item.accent ? ACCENT_BAR[item.accent] : "bg-primary";

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-active text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-active/60 hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          aria-hidden
          className={cn(
            "absolute inset-y-1.5 start-0 w-0.5 rounded-full",
            bar,
          )}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon
        className={cn(
          "size-4.5 shrink-0 transition-colors",
          active
            ? item.accent
              ? `text-tool-${item.accent}`
              : "text-primary"
            : "text-current",
          !collapsed && "me-3",
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  );
}
