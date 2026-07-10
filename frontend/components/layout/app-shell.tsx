"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar, SidebarNavList } from "@/components/layout/sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-topbar";
import { Brand } from "@/components/layout/brand";
import { PanelFooter } from "@/components/layout/footer";
import { useI18n } from "@/lib/i18n/provider";

const COLLAPSE_KEY = "cropai-sidebar";

// The whole-app panel shell: persistent sidebar + sticky top bar wrapping every page.
// Rendered below the providers, so {children} (server or client pages) pass through
// untouched. Desktop collapse state is persisted; mobile uses a drawer.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, dir } = useI18n();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Restore collapse preference on mount (localStorage is client-only).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const drawerSide = dir === "rtl" ? "right" : "left";

  return (
    <div className="flex min-h-svh">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={drawerSide} className="w-72 bg-sidebar p-0">
          <SheetHeader className="h-16 justify-center border-b border-sidebar-border">
            <SheetTitle className="text-start">
              <Brand />
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t.sidebar.primaryNav}
            </SheetDescription>
          </SheetHeader>
          <SidebarNavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
        <PanelFooter />
      </div>
    </div>
  );
}
