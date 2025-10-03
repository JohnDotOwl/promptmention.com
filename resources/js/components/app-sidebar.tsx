import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator
} from '@/components/ui/sidebar';
import { ProjectSwitcher, type Monitor } from '@/components/sidebar/project-switcher';
import { UsageMetrics } from '@/components/sidebar/usage-metrics';
import {
    DashboardNav,
    MonitoringNav,
    AnalyticsNav,
    WebsiteNav
} from '@/components/sidebar/nav-groups';
import AppLogo from '@/components/app-logo';
import WaitlistIndicator from '@/components/WaitlistIndicator';
import CerebrasBadge from '@/components/CerebrasBadge';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface AppSidebarProps {
    monitors?: Monitor[]
}

export function AppSidebar({ monitors = [] }: AppSidebarProps) {
    const { auth } = usePage<SharedData>().props;

    // Fallback: Get monitors from page props if not passed as prop
    const pageMonitors = usePage<SharedData>().props.monitors || [];
    const allMonitors = monitors.length > 0 ? monitors : pageMonitors;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="p-0">
                <div className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border/50 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 group-data-[collapsible=icon]:justify-center">
                    <AppLogo />
                </div>
                <div className="px-4 pt-2 pb-2 border-b border-border">
                    <ProjectSwitcher monitors={allMonitors} />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <DashboardNav />
                <MonitoringNav />
                <AnalyticsNav />
                <WebsiteNav />
                <div className="mt-auto">
                    <CerebrasBadge />
                    <WaitlistIndicator user={auth?.user} />
                </div>
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator />
                <UsageMetrics />
                <SidebarSeparator />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
