"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HealthBadge } from "@/components/common/health-badge";
import { Brand } from "@/components/layout/brand";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { NAV_GROUPS, isNavActive } from "@/components/layout/sidebar-nav";
import { useI18n } from "@/lib/i18n/provider";

// The grouped nav list, shared by the desktop rail and the mobile drawer so the two
// never drift. Collapsed mode (icons + tooltips) is desktop-only.
export function SidebarNavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t, dir } = useI18n();
  const tooltipSide = dir === "rtl" ? "left" : "right";

  return (
    <nav
      aria-label={t.sidebar.primaryNav}
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4"
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.titleKey} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {t.navGroups[group.titleKey]}
            </p>
          )}
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              label={t.nav[item.labelKey]}
              active={isNavActive(item.href, pathname)}
              collapsed={collapsed}
              tooltipSide={tooltipSide}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

// Persistent desktop rail (hidden below lg; mobile uses the drawer in AppShell).
export function Sidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { t } = useI18n();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <Brand iconOnly={collapsed} />
      </div>

      <SidebarNavList collapsed={collapsed} />

      <div
        className={cn(
          "flex items-center gap-2 border-t border-sidebar-border p-3",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        {!collapsed && <HealthBadge />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          aria-label={collapsed ? t.sidebar.expand : t.sidebar.collapse}
          className="text-sidebar-foreground hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="rtl:rotate-180" />
          ) : (
            <PanelLeftClose className="rtl:rotate-180" />
          )}
        </Button>
      </div>
    </aside>
  );
}
