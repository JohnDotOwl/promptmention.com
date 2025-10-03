import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { CopyButton } from '@/components/ui/copy-button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crawler Analytics',
        href: '/settings/crawler-analytics',
    },
];

const mockProjectId = 'bedba439-53b3-4c5f-bbdc-42d2fccb800c';

interface Monitor {
  name: string;
  website_name: string;
  website_url: string;
}

interface CrawlerAnalyticsPageProps {
  monitors?: Monitor[];
}

export default function CrawlerAnalytics({ monitors = [] }: CrawlerAnalyticsPageProps) {
  // Get the first monitor's website name, or fallback to a default
  const currentMonitorName = monitors.length > 0
    ? monitors[0].website_name
    : 'your website';

  const analyticsScript = `<script>
(function() {
  // Check if script already exists to avoid duplicates
  if (document.querySelector('script[data-pm-project-id]')) {
    return;
  }

  var script = document.createElement('script');
  script.setAttribute('data-pm-project-id', '${mockProjectId}');
  script.src = 'https://ingest.promptmention.com/js/promptmention-tracker.js';
  script.async = true;
  script.onerror = function() {
    console.error('Failed to load PromptMention analytics script');
  };
  document.head.appendChild(script);
})();
</script>`;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crawler Analytics" />

            <SettingsLayout>
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
                        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
                            <div className="leading-none font-semibold">Analytics Settings</div>
                            <div className="text-muted-foreground text-sm">Manage your analytics settings.</div>
                        </div>
                        <div className="px-5 pb-4">
                            <div className="border-t pt-4">
                                <div className="space-y-4 overflow-hidden">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold leading-relaxed">Getting started</h2>
                                            <p className="text-sm">Let PromptMention analyze traffic on your website, to gain insights into AI traffic and usage.</p>
                                        </div>
                                        <ol className="list-decimal list-inside space-y-6">
                                            <li className="space-y-2 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full tabular-nums text-xs bg-primary text-white flex items-center justify-center shrink-0">1</div>
                                                <div className="space-y-2 flex-1 overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm">Paste this code into the head of <strong className="font-semibold">{currentMonitorName}</strong>:</p>
                                                    </div>
                                                    <pre className="px-4 py-2 bg-muted rounded-lg w-full overflow-x-scroll text-sm">{analyticsScript}</pre>
                                                    <div className="flex items-center gap-2">
                                                        <CopyButton text={analyticsScript}>Copy script</CopyButton>
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="space-y-2 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full tabular-nums text-xs bg-primary text-white flex items-center justify-center shrink-0">2</div>
                                                <div className="space-y-2 flex-1">
                                                    <p className="text-sm">When correctly implemented in your website, your first Visitor Analytics data will be available within a few minutes.</p>
                                                    <CopyButton text="#" className="cursor-pointer">Start receiving data</CopyButton>
                                                </div>
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}