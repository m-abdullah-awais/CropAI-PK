import {
  LayoutDashboard,
  Sprout,
  LineChart,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { dict } from "@/lib/i18n/translations";

type NavKey = keyof (typeof dict.en)["nav"];
type GroupKey = keyof (typeof dict.en)["navGroups"];
type Accent = "recommend" | "yield" | "rotation";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: NavKey;
  accent?: Accent;
}

export interface NavGroup {
  titleKey: GroupKey;
  items: NavItem[];
}

// Single source of truth for both the desktop rail and the mobile drawer, so the two
// can never drift. Labels resolve through t.nav.* / t.navGroups.* at render time.
export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: "overview",
    items: [{ href: "/", icon: LayoutDashboard, labelKey: "dashboard" }],
  },
  {
    titleKey: "tools",
    items: [
      { href: "/recommend", icon: Sprout, labelKey: "recommend", accent: "recommend" },
      { href: "/yield", icon: LineChart, labelKey: "yield", accent: "yield" },
      { href: "/rotation", icon: RefreshCw, labelKey: "rotation", accent: "rotation" },
    ],
  },
];

export function isNavActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
