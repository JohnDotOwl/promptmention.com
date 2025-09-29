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
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface AppSidebarProps {
    monitors?: Monitor[]
}

export function AppSidebar({ monitors = [] }: AppSidebarProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="p-0">
                <div className="flex items-center gap-2 px-4 h-14 border-b border-border group-data-[collapsible=icon]:justify-center">
                    <AppLogo />
                </div>
                <div className="px-4 pt-2 pb-2 border-b border-border">
                    <ProjectSwitcher monitors={monitors} />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <DashboardNav />
                {/* <MonitoringNav /> */}
                {/* <AnalyticsNav /> */}
                {/* <WebsiteNav /> */}
                <div className="mt-auto">
                    <WaitlistIndicator user={auth?.user as any} />
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
