import * as React from "react"
import {
  ChartArea,
  Eclipse,
  Swords,
  UserPen,
  Radar,
  SquareChevronRight,
  MessageCircleMore,
  PencilLine,
  Bot,
  ListTree,
  Loader2
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, usePage } from "@inertiajs/react"
import { type NavItem } from "@/types"
import { useIsNavigatingTo } from "@/hooks/use-navigation-loading"
import { useHoverPrefetch } from "@/hooks/use-hover-prefetch"

// Dashboard navigation items
export const dashboardItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: ChartArea,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: Eclipse,
  },
  {
    title: "Competitors",
    href: "/competitors",
    icon: Swords,
  },
  ]

// Monitoring navigation items
export const monitoringItems: NavItem[] = [
  {
    title: "Monitors",
    href: "/monitors",
    icon: Radar,
  },
  {
    title: "Prompts",
    href: "/prompts",
    icon: SquareChevronRight,
  },
  {
    title: "Responses",
    href: "/responses",
    icon: MessageCircleMore,
  },
  {
    title: "Mentions",
    href: "/mentions",
    icon: PencilLine,
  },
]

// Analytics navigation items
export const analyticsItems: NavItem[] = [
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartArea,
  },
  {
    title: "Crawlers",
    href: "/crawlers",
    icon: Bot,
  },
]

// Website navigation items
export const websiteItems: NavItem[] = [
  {
    title: "Sitemap",
    href: "/sitemap",
    icon: ListTree,
  },
]

interface NavGroupProps {
  label?: string
  items: NavItem[]
  className?: string
}

export function NavGroup({ label, items, className }: NavGroupProps) {
  const page = usePage()

  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavItem key={item.title} item={item} page={page} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

interface PageProps {
  url: string
  [key: string]: unknown
}

interface NavItemProps {
  item: NavItem
  page: PageProps
}

function NavItem({ item, page }: NavItemProps) {
  const isNavigating = useIsNavigatingTo(item.href);
  const isActive = page.url.startsWith(item.href);
  const hoverProps = useHoverPrefetch(item.href, {
    priority: 'high', // Reduced from 100ms to 25ms for faster sidebar navigation
    immediate: false,
    smartHover: true // Enable smart hover for sidebar
  });

  return (
    <SidebarMenuItem id={`${item.title.toLowerCase().replace(/\s+/g, '-')}-sidebar-menu-item`}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={{ children: item.title }}
        className={isNavigating ? 'opacity-70 pointer-events-none' : ''}
      >
        <Link
          href={item.href}
          prefetch
          {...hoverProps}
        >
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            item.icon && <item.icon />
          )}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Convenience components for each navigation group
export function DashboardNav() {
  return <NavGroup items={dashboardItems} />
}

export function MonitoringNav() {
  return <NavGroup label="Monitoring" items={monitoringItems} />
}

export function AnalyticsNav() {
  return <NavGroup label="Analytics" items={analyticsItems} />
}

export function WebsiteNav() {
  return <NavGroup label="Website" items={websiteItems} />
}